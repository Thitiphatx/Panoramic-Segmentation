from fastapi import APIRouter, HTTPException

from src.schemas.core import ApiResponse
from src.core.errors import JobServiceUnavailableError
from src.schemas.job import JobList
from src.services.jobs_service import JobService

router = APIRouter(prefix="/api/job", tags=["job"])


@router.get("", response_model=ApiResponse[JobList])
def list_jobs() -> ApiResponse[JobList]:
    return ApiResponse(success=True, data=JobList(jobs=JobService.list_jobs()))


@router.delete("/{job_id}", status_code=501)
def cancel_job(job_id: str) -> None:
    try:
        JobService.cancel_job(job_id)
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc
