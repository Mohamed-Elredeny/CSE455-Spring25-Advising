# Task 1 week5 : Data base Schema
# Task 2 week6 : Implement recurring appointments
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Appointment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    student_id: str
    advisor_id: str
    date_time: datetime
    status: str = "pending"  # Default status
    reason: Optional[str] = None

    recurring: bool = False  #
    recurrence_pattern: Optional[str] = None  # "daily", "weekly", "monthly"
    recurrence_end_date: Optional[datetime] = None  # End date for recurrence
    reminder_sent: bool = False  # Track if reminder was sent

    notes: Optional[dict] = {
        "summary": "Initial thesis discussion",
        "action_items": ["Submit draft", "Review feedback"],    
    }


    class Config:
        orm_mode = True