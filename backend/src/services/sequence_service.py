import io
from datetime import timedelta
from sqlmodel import Session, select
from src.model.frame import Frame
from src.model.sequence import Sequence
from src.services.storage_service import StorageService

MISSING_OBJECT_CODES = {"NoSuchKey", "NoSuchObject", "NotFound"}


class SequenceService:
    data_images_path = "raw/data_images"
    preview_url_ttl = timedelta(hours=1)

    def __init__(self, session: Session, storage: StorageService) -> None:
        self.session = session
        self.storage = storage

    def get_sequences(self) -> list[Sequence]:
        with self.session as session:
            sequences = list(session.exec(select(Sequence)).all())
            for sequence in sequences:
                preview = sequence.metadata_.get("preview")
                if preview:
                    sequence.metadata_["preview"] = self.storage.access_url(
                        preview, expires=self.preview_url_ttl
                    )
            return sequences

    def get_frames(self, sequence_id: str) -> list[Frame]:
        with self.session as session:
            frames = list(
                session.exec(
                    select(Frame).where(Frame.sequence_id == sequence_id)
                ).all()
            )
            for frame in frames:
                paths = frame.metadata_.get("path", {})
                raw_path = paths.get("raw") if isinstance(paths, dict) else None
                if raw_path:
                    paths["raw"] = self.storage.access_url(
                        raw_path, expires=self.preview_url_ttl
                    )
            return frames


