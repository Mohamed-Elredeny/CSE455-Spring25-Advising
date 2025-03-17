# main.py
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware
from models.notification import Notification, NotificationCreate, NotificationType
from database import notification_collection, check_connection
from datetime import datetime
import uuid
from pydantic import BaseModel

# Pydantic model for PATCH request
class UpdateNotification(BaseModel):
    status: str

# Lifespan event handler
async def lifespan(app: FastAPI):
    await check_connection()
    yield

# Create the FastAPI app once with the lifespan
app = FastAPI(title="Notification Manager API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specify the frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PATCH, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/notifications/", response_model=Notification)
async def create_notification(notification: NotificationCreate):
    notification_dict = notification.dict()
    notification_dict["id"] = str(uuid.uuid4())
    notification_dict["created_at"] = datetime.utcnow()
    await notification_collection.insert_one(notification_dict)
    return notification_dict

@app.get("/notifications/{user_id}", response_model=list[Notification])
async def get_notifications(user_id: str):
    notifications = []
    async for notification in notification_collection.find({"user_id": user_id}):
        notifications.append(Notification(**notification))
    return notifications

@app.get("/notifications/{user_id}/type/{notification_type}", response_model=list[Notification])
async def get_notifications_by_type(user_id: str, notification_type: NotificationType):
    notifications = []
    async for notification in notification_collection.find(
        {"user_id": user_id, "type": notification_type}
    ):
        notifications.append(Notification(**notification))
    return notifications

@app.patch("/notifications/{notification_id}")
async def update_notification(notification_id: str, update: UpdateNotification):
    if update.status not in ["unread", "read", "dismissed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await notification_collection.update_one(
        {"id": notification_id},
        {"$set": {"status": update.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification updated"}

@app.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    result = await notification_collection.delete_one({"id": notification_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}