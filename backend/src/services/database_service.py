from collections.abc import Callable

from src.core.errors import StorageSyncCancelledError
from sqlmodel import Session, select
from src.model.frame import Frame
from src.model.sequence import Sequence
from src.services.storage_service import StorageService


class DatabaseService:
    def __init__(
        self,
        session: Session,
        storage: StorageService,
        progress_callback: Callable[[dict[str, str | int]], None] | None = None,
        cancel_check: Callable[[], bool] | None = None,
    ) -> None:
        self.session = session
        self.storage = storage
        self.progress_callback = progress_callback
        self.cancel_check = cancel_check

    def _report_progress(self, values: dict[str, str | int]) -> None:
        if self.progress_callback:
            self.progress_callback(values)

    def sync_storage(self) -> None:
        """Sync metadata and sequences from storage into the database."""
        storage = self.storage
        self._check_cancelled()
        self._report_progress(
            {"stage": "discovering", "progress": 0,
             "message": "Listing sequences and frames"}
        )
        storage_sequence_ids = storage.list_sequence_ids()

        with self.session as session:
            existing_sequences = {
                sequence.id: sequence for sequence in session.exec(select(Sequence)).all()
            }
            existing_frames = {
                (frame.sequence_id, frame.id): frame
                for frame in session.exec(select(Frame)).all()
            }

            # Sequences first, so the Frame.sequence_id foreign key is satisfied.
            sequence_images: dict[str, list[str]] = {}
            sequence_timestamps: dict[str, list[str]] = {}
            for seq_id in storage_sequence_ids:
                self._check_cancelled()
                sequence_images[seq_id] = storage.list_image_ids(seq_id)
                sequence_timestamps[seq_id] = storage.get_timestamps(seq_id)
                self._report_progress(
                    {
                        "stage": "discovering",
                        "current_sequence": seq_id,
                        "message": "Listing sequence contents",
                    }
                )
            total_frames = sum(len(image_ids) for image_ids in sequence_images.values())
            self._report_progress(
                {
                    "stage": "frames",
                    "completed": 0,
                    "total": total_frames,
                    "progress": 0,
                    "message": "Syncing frame metadata",
                }
            )
            for seq_id in storage_sequence_ids:
                image_ids = sequence_images[seq_id]
                sequence_metadata = {
                    "preview": (
                        f"{storage.bucket}/{storage.image_path(seq_id, image_ids[0])}"
                        if image_ids
                        else ""
                    ),
                    "frame": len(image_ids),
                    "duration": len(image_ids) / 60,
                    "status": "Ready",
                    "date": sequence_timestamps[seq_id][0] if sequence_timestamps[seq_id] else "",
                }
                sequence = existing_sequences.get(seq_id)
                if sequence is None:
                    session.add(Sequence(id=seq_id, metadata=sequence_metadata))
                else:
                    sequence.metadata_ = sequence_metadata
            session.flush()

            new_frames: list[Frame] = []
            completed_frames = 0
            for seq_id in storage_sequence_ids:
                self._check_cancelled()
                for frame_index, frame_id in enumerate(sequence_images[seq_id]):
                    self._check_cancelled()
                    timestamps = sequence_timestamps[seq_id]
                    frame_key = (seq_id, frame_id)
                    frame = existing_frames.get(frame_key)
                    gps_metadata = storage.get_gps_metadata(seq_id, frame_id)
                    frame_metadata = {
                        "status": "Ready",
                        "date": timestamps[frame_index] if frame_index < len(timestamps) else "",
                        "gps": gps_metadata,
                        "path": {
                            "raw": f"{storage.bucket}/{storage.image_path(seq_id, frame_id)}",
                            "segmented": "",
                        },
                    }
                    if frame is None:
                        new_frames.append(
                            Frame(id=frame_id, sequence_id=seq_id, metadata=frame_metadata)
                        )
                        existing_frames[frame_key] = new_frames[-1]
                    else:
                        frame.sequence_id = seq_id
                        frame.metadata_ = frame_metadata
                    completed_frames += 1
                    self._report_progress(
                        {
                            "stage": "frames",
                            "completed": completed_frames,
                            "total": total_frames,
                            "progress": round(completed_frames / total_frames * 95)
                            if total_frames
                            else 95,
                            "current_sequence": seq_id,
                            "current_frame": frame_id,
                            "message": "Syncing frame metadata",
                        }
                    )
            self._report_progress(
                {
                    "stage": "saving",
                    "completed": total_frames,
                    "total": total_frames,
                    "progress": 98,
                    "message": "Saving metadata",
                }
            )
            self._check_cancelled()
            session.add_all(new_frames)
            session.commit()

    def _check_cancelled(self) -> None:
        if self.cancel_check and self.cancel_check():
            raise StorageSyncCancelledError


