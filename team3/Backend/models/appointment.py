# Task 1 : Data base Schema

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Appointment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    student_id: str
    advisor_id: str
    date_time: datetime
    status: str  # Scheduled, Completed, Canceled
    reason: Optional[str] = None

    class Config:
        orm_mode = True
