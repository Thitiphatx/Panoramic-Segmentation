from pydantic import BaseModel


class JobList(BaseModel):
    jobs: list[dict[str, object]]
