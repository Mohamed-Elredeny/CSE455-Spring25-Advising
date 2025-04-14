# models/notification.py
import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict
from enum import Enum

class NotificationType(str, Enum):
    REMINDER = "reminder"
    ALERT = "alert"
    UPDATE = "update"

class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    status: str = "unread"
    metadata: Optional[Dict] = None

class NotificationGroup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationPreference(BaseModel):
    user_id: str
    group_id: str
    email_enabled: bool = True
    in_app_enabled: bool = True
    frequency: str = "immediate"  # immediate, daily, weekly
    quiet_hours_start: Optional[str] = None  # Format: "HH:MM"
    quiet_hours_end: Optional[str] = None    # Format: "HH:MM"

class NotificationCreate(NotificationBase):
    group_id: Optional[str] = None


class Notification(NotificationBase):
    id: str
    created_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True  # Updated from orm_mode to from_attributes
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }