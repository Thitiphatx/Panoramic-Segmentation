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
                if isinstance(paths, dict):
                    for path_kind in ("raw", "segmented"):
                        object_path = paths.get(path_kind)
                        if object_path:
                            paths[path_kind] = self.storage.access_url(
                                object_path, expires=self.preview_url_ttl
                            )
            return frames


