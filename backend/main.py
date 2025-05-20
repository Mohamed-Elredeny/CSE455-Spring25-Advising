from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models.notification import Notification, NotificationCreate, NotificationGroup, NotificationPreference
from database import notification_collection, check_connection, notification_groups_collection, notification_preferences_collection
from datetime import datetime
import uuid
from pydantic import BaseModel
from fastapi import BackgroundTasks
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import json

load_dotenv()

frontend_url = os.getenv("FRONTEND_URL")

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

    async def broadcast_to_group(self, group_id: str, message: dict):
        group = notification_groups_collection.find_one({"id": group_id})
        if group and "members" in group:
            for user_id in group["members"]:
                await self.broadcast_to_user(user_id, message)

manager = ConnectionManager()

def send_email(to_email: str, subject: str, body: str):
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not sender_email or not sender_password:
        raise ValueError("Email credentials are not set in environment variables.")

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise

class UpdateNotification(BaseModel):
    status: str

class GroupMembership(BaseModel):
    college_id: str
    group_id: str

def lifespan(app: FastAPI):
    check_connection()
    yield

app = FastAPI(title="Notification Manager API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.post("/notifications/", response_model=Notification)
async def create_notification(notification: NotificationCreate, background_tasks: BackgroundTasks):
    notification_dict = notification.dict()
    notification_dict["id"] = str(uuid.uuid4())
    notification_dict["created_at"] = datetime.utcnow()
    
    notification_collection.insert_one(notification_dict)
    
    ws_message = {
        "id": notification_dict["id"],
        "user_id": notification_dict["user_id"],
        "type": notification_dict["type"],
        "title": notification_dict["title"],
        "message": notification_dict["message"],
        "status": notification_dict["status"],
        "created_at": notification_dict["created_at"].isoformat(),
        "metadata": notification_dict["metadata"]
    }
    
    if notification_dict.get("group_id"):
        await manager.broadcast_to_group(notification_dict["group_id"], ws_message)
    elif notification_dict["user_id"]:
        await manager.broadcast_to_user(notification_dict["user_id"], ws_message)
    
    preferences = notification_preferences_collection.find_one({
        "user_id": notification_dict["user_id"],
        "group_id": notification_dict.get("group_id")
    })
    
    if preferences and preferences.get("email_enabled"):
        current_time = datetime.now().strftime("%H:%M")
        quiet_start = preferences.get("quiet_hours_start")
        quiet_end = preferences.get("quiet_hours_end")
        
        should_send = True
        if quiet_start and quiet_end:
            if quiet_start <= current_time <= quiet_end:
                should_send = False
        
        if should_send:
            to_email = "aiu-advising-system@maildrop.cc"
            subject = "New Notification"
            body = f"Title: {notification.title}\nMessage: {notification.message}"
            background_tasks.add_task(send_email, to_email, subject, body)
    
    return notification_dict

@app.get("/notifications/{user_id}", response_model=list[Notification])
async def get_notifications(user_id: str):
    return [Notification(**notification) for notification in notification_collection.find({"user_id": user_id})]

@app.get("/notifications/{user_id}/type/{notification_type}", response_model=list[Notification])
async def get_notifications_by_type(user_id: str, notification_type: str):
    return [Notification(**notification) for notification in notification_collection.find(
        {"user_id": user_id, "type": notification_type}
    )]

@app.patch("/notifications/{notification_id}")
async def update_notification(notification_id: str, update: UpdateNotification):
    if update.status not in ["unread", "read", "dismissed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = notification_collection.update_one(
        {"id": notification_id},
        {"$set": {"status": update.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification updated"}

@app.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    result = notification_collection.delete_one({"id": notification_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}

@app.post("/notification-groups/", response_model=NotificationGroup)
async def create_notification_group(group: NotificationGroup):
    group_dict = group.dict()
    notification_groups_collection.insert_one(group_dict)
    return group_dict

@app.get("/notification-groups/", response_model=list[NotificationGroup])
async def get_notification_groups():
    return [NotificationGroup(**group) for group in notification_groups_collection.find()]

@app.post("/notification-groups/members/")
async def add_group_member(membership: GroupMembership):
    user = notification_preferences_collection.find_one({"college_id": membership.college_id})
    if not user:
        raise HTTPException(status_code=404, detail="User with given college ID not found")
    
    result = notification_groups_collection.update_one(
        {"id": membership.group_id},
        {"$addToSet": {"members": user["user_id"]}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Group not found or user already in group")
    
    return {"message": "User added to group successfully"}

@app.post("/notification-preferences/", response_model=NotificationPreference)
async def create_notification_preference(preference: NotificationPreference):
    existing = notification_preferences_collection.find_one({
        "user_id": preference.user_id,
        "group_id": preference.group_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Preference already exists")
    
    preference_dict = preference.dict()
    notification_preferences_collection.insert_one(preference_dict)
    return preference_dict

@app.get("/notification-preferences/{user_id}", response_model=list[NotificationPreference])
async def get_user_preferences(user_id: str):
    return [NotificationPreference(**pref) for pref in notification_preferences_collection.find({"user_id": user_id})]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)