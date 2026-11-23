from src.core.errors import JobServiceUnavailableError


class JobService:
    @staticmethod
    def list_jobs() -> list[dict[str, object]]:
        return []

    @staticmethod
    def cancel_job(job_id: str) -> None:
        raise JobServiceUnavailableError("Job cancellation is not available until the worker service is implemented")

    @staticmethod
    def submit_frame(sequence_id: str, frame_id: str) -> None:
        raise JobServiceUnavailableError("Job submission is not available until the worker service is implemented")


