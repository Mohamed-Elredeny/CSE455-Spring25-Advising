# main.py
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware
from models.notification import Notification, NotificationCreate, NotificationGroup, NotificationType, NotificationPreference
from database import notification_collection, check_connection, notification_groups_collection, notification_preferences_collection
from datetime import datetime
import uuid
from pydantic import BaseModel
from fastapi import BackgroundTasks  # Import BackgroundTasks for async email sending
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
load_dotenv()

# Helper function to send email
def send_email(to_email: str, subject: str, body: str):
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")

    # Check if email credentials are loaded
    if not sender_email or not sender_password:
        raise ValueError("Email credentials are not set in environment variables.")

    # Create the email
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    # Send the email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise
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

# Update the create_notification endpoint to use groups and preferences
@app.post("/notifications/", response_model=Notification)
async def create_notification(notification: NotificationCreate, background_tasks: BackgroundTasks):
    notification_dict = notification.dict()
    notification_dict["id"] = str(uuid.uuid4())
    notification_dict["created_at"] = datetime.utcnow()
    
    # Get user preferences
    preferences = await notification_preferences_collection.find_one({
        "user_id": notification_dict["user_id"],
        "group_id": notification_dict.get("group_id")
    })
    
    # Check if should send email based on preferences
    if preferences and preferences.get("email_enabled"):
        # Check quiet hours
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

@app.post("/notification-groups/", response_model=NotificationGroup)
async def create_notification_group(group: NotificationGroup):
    group_dict = group.dict()
    await notification_groups_collection.insert_one(group_dict)
    return group_dict

@app.get("/notification-groups/", response_model=list[NotificationGroup])
async def get_notification_groups():
    groups = []
    async for group in notification_groups_collection.find():
        groups.append(NotificationGroup(**group))
    return groups

# Notification Preferences endpoints
@app.post("/notification-preferences/", response_model=NotificationPreference)
async def create_notification_preference(preference: NotificationPreference):
    # Check if preference already exists for this user and group
    existing = await notification_preferences_collection.find_one({
        "user_id": preference.user_id,
        "group_id": preference.group_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Preference already exists")
    
    preference_dict = preference.dict()
    await notification_preferences_collection.insert_one(preference_dict)
    return preference_dict

@app.get("/notification-preferences/{user_id}", response_model=list[NotificationPreference])
async def get_user_preferences(user_id: str):
    preferences = []
    async for pref in notification_preferences_collection.find({"user_id": user_id}):
        preferences.append(NotificationPreference(**pref))
    return preferences

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)