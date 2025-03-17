# models/notification.py
from pydantic import BaseModel
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
    message: str
    status: str = "unread"
    metadata: Optional[Dict] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: str
    created_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True  # Updated from orm_mode to from_attributes
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }