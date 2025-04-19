from pydantic import BaseModel
from typing import List

class RequirementCreate(BaseModel):
    program: str
    type: str
    course_codes: List[str]  # List of course codes

class Requirement(BaseModel):
    id : int
    program: str
    type: str
    course_code:str

    class Config:
        from_attributes = True