import logging
import re
import time
from io import BytesIO

from minio import Minio
from PIL import Image
from redis import Redis
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

from src.core.config import settings
from src.core.transformer import class_coverage, colorize_mask
from src.inferer.inferer import SegformerPredictor
from src.models import Frame, FrameResult, Sequence

logger = logging.getLogger("segmentation-worker")


def claim_job(redis: Redis, job_id: str) -> dict[str, str] | None:
    """Claim a queued pending job exactly once, allowing safe duplicate queue IDs."""
    key = f"job:{job_id}"
    claimed = redis.eval(
        "if redis.call('hget', KEYS[1], 'status') ~= 'pending' then return 0 end "
        "redis.call('hset', KEYS[1], 'status', 'processing', 'started_at', ARGV[1]) "
        "return 1",
        1,
        key,
        str(time.time()),
    )
    return redis.hgetall(key) if claimed else None


def process_job(
    job_id: str,
    job: dict[str, str],
    redis: Redis,
    engine: Engine,
    storage: Minio,
    predictors: dict[str, SegformerPredictor],
) -> None:
    model_id = job.get("model_id", "")
    sequence_id = job.get("sequence_id", "")
    try:
        model_match = re.fullmatch(r"(?:segformer-)?b([0-5])(?:-cityscapes)?", model_id)
        if not model_match:
            raise ValueError(f"Unsupported model_id: {model_id}")
        variant = f"b{model_match.group(1)}"
        model_dir = settings.model_dir / variant
        if not model_dir.is_dir():
            raise FileNotFoundError(f"Model {model_id} is unavailable at {model_dir}")
        predictor = predictors.get(variant)
        if predictor is None:
            predictor = predictors[variant] = SegformerPredictor(model_dir)

        with Session(engine) as session:
            sequence = session.get(Sequence, sequence_id)
            if sequence is None:
                raise ValueError(f"Sequence {sequence_id} was not found")
            sequence.metadata_ = {**sequence.metadata_, "status": "Processing"}
            session.add(sequence)
            session.commit()

            frames = session.exec(
                select(Frame).where(Frame.sequence_id == sequence_id).order_by(Frame.id)
            ).all()
            if not frames:
                raise ValueError(f"No frames found for sequence {sequence_id}")
            redis.hset(f"job:{job_id}", mapping={"total": len(frames), "completed": 0})

            for index, frame in enumerate(frames, start=1):
                if redis.hget(f"job:{job_id}", "cancel_requested") == "1":
                    sequence.metadata_ = {**sequence.metadata_, "status": "Ready"}
                    session.add(sequence)
                    session.commit()
                    redis.hset(f"job:{job_id}", mapping={
                        "status": "cancelled", "finished_at": time.time(),
                    })
                    return
                raw_path = frame.metadata_.get("path", {}).get("raw", "")
                bucket, separator, object_name = raw_path.partition("/")
                if not separator or not object_name:
                    raise ValueError(f"Frame {frame.id} has no valid raw object path")

                response = storage.get_object(bucket, object_name)
                try:
                    image = Image.open(BytesIO(response.read())).convert("RGB")
                finally:
                    response.close()
                    response.release_conn()

                mask, elapsed_ms, labels = predictor.predict(image)
                coverage = class_coverage(mask, labels)
                most_found = max(coverage, key=lambda item: item["pixel_count"])
                result_image = colorize_mask(mask)
                output = BytesIO()
                result_image.save(output, format="PNG", optimize=True)
                output.seek(0)

                result_key = f"segmented/{model_id}/{sequence_id}/{frame.id}.png"
                storage.put_object(
                    settings.s3_bucket,
                    result_key,
                    output,
                    length=output.getbuffer().nbytes,
                    content_type="image/png",
                )
                percentages = {item["class_name"]: item["percentage"] for item in coverage}
                frame_result = session.get(FrameResult, (sequence_id, frame.id, model_id))
                if frame_result is None:
                    frame_result = FrameResult(
                        sequence_id=sequence_id,
                        frame_id=frame.id,
                        model_id=model_id,
                        most_found_class=most_found["class_name"],
                        classes=percentages,
                    )
                    session.add(frame_result)
                else:
                    frame_result.most_found_class = most_found["class_name"]
                    frame_result.classes = percentages
                frame.metadata_.setdefault("path", {})["segmented"] = f"{settings.s3_bucket}/{result_key}"
                frame.metadata_["status"] = "Segmented"
                session.add(frame)
                session.commit()
                redis.hset(f"job:{job_id}", mapping={
                    "completed": index,
                    "progress": round(index * 100 / len(frames)),
                    "current_frame": frame.id,
                    "inference_time_ms": round(elapsed_ms, 3),
                })

            sequence.metadata_ = {**sequence.metadata_, "status": "Segmented"}
            session.add(sequence)
            session.commit()

        redis.hset(f"job:{job_id}", mapping={"status": "completed", "finished_at": time.time()})
    except Exception as exc:
        logger.exception("Job %s failed", job_id)
        try:
            with Session(engine) as session:
                sequence = session.get(Sequence, sequence_id)
                if sequence is not None:
                    sequence.metadata_ = {**sequence.metadata_, "status": "Ready"}
                    session.add(sequence)
                    session.commit()
        except Exception:
            logger.exception("Could not reset sequence %s after job failure", sequence_id)
        redis.hset(f"job:{job_id}", mapping={
            "status": "failed", "error": str(exc), "finished_at": time.time(),
        })
