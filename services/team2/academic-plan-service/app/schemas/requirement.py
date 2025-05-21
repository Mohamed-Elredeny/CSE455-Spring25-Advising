from pydantic import BaseModel
from datetime import datetime

class RequirementBase(BaseModel):
    program: str
    total_hours: int
    num_core_courses: int
    num_elective_courses: int

class RequirementCreate(RequirementBase):
    pass

class RequirementUpdate(BaseModel):
    total_hours: int
    num_core_courses: int
    num_elective_courses: int

class Requirement(RequirementBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True