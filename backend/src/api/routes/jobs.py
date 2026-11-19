from fastapi import APIRouter, HTTPException

from src.schemas.core import ApiResponse
from src.schemas.job import JobList

router = APIRouter(prefix="/api/job", tags=["job"])


@router.get("", response_model=ApiResponse[JobList])
def list_jobs() -> ApiResponse[JobList]:
    return ApiResponse(success=True, data=JobList(jobs=[]))


@router.delete("/{job_id}", status_code=501)
def cancel_job(job_id: str) -> None:
    raise HTTPException(
        status_code=501,
        detail="Job cancellation is not available until the worker service is implemented",
    )
