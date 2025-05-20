import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict

class NotificationBase(BaseModel):
    user_id: str
    type: str  # Changed from NotificationType enum to str for flexibility
    title: str
    message: str
    status: str = "unread"
    metadata: Optional[Dict] = None

class NotificationGroup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    members: list[str] = []  # Added members field to track user_ids

class NotificationPreference(BaseModel):
    user_id: str
    group_id: str
    college_id: Optional[str] = None  # Added college_id field
    email_enabled: bool = True
    in_app_enabled: bool = True
    frequency: str = "immediate"
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class NotificationCreate(NotificationBase):
    group_id: Optional[str] = None

class Notification(NotificationBase):
    id: str
    created_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

        