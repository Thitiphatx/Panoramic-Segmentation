from fastapi import APIRouter, Depends, HTTPException

from src.schemas.core import ApiResponse
from src.schemas.job import JobList
from src.dependencies import get_job_service
from src.services.jobs_service import JobService

router = APIRouter(prefix="/api/job", tags=["job"])


@router.get("", response_model=ApiResponse[JobList])
def list_jobs(service: JobService = Depends(get_job_service)) -> ApiResponse[JobList]:
    return ApiResponse(success=True, data=JobList(jobs=service.list_jobs()))


@router.delete("/{job_id}", status_code=204)
def cancel_job(
    job_id: str,
    service: JobService = Depends(get_job_service),
) -> None:
    service.cancel_job(job_id)
