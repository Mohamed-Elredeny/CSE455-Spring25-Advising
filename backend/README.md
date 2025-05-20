

# 📢 Notification Service Documentation

## 📄 Overview

This document outlines the **Notification API**, which provides functionality for managing:

* Notifications
* Notification groups
* User preferences

The API supports:

* RESTful endpoints
* WebSocket connections for real-time updates
* MongoDB for data storage
* Email notifications

---

## ⚙️ Setup and Installation

### ✅ Prerequisites

* **Python 3.8+** – Required to run the application
* **MongoDB Atlas Account** – For database connectivity
* **Docker** – For containerization
* **Kubernetes** (Minikube or Kind) – For orchestration and deployment


---

### 🖥️ Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🐳 Docker Deployment

### 🏗️ Build Image

```bash
docker build -t novaxe/notification-service:latest .
docker push novaxe/notification-service:latest
```

---

## ☸️ Kubernetes Deployment

### 🔐 Create Secrets

```bash
kubectl apply -f secrets.yaml
```

### 🚀 Deploy Application

```bash
kubectl apply -f deployment.yaml
```

### 🌐 Expose Service

```bash
kubectl apply -f service.yaml
```

---

## 📡 API Endpoints

### 🔍 1. Health Check

* **Endpoint:** `GET /health`
* **Description:** Verifies the operational status of the API

#### ✅ Example

```bash
curl -X GET "$URL/health"
```

**Response:**

```json
{
  "status": "healthy"
}
```

---

### 🔔 2. Notifications

#### 📨 Create Notification

* **Endpoint:** `POST /notifications/`
* **Description:** Creates a new notification for a user

<details>
<summary>Request Model</summary>

```python
class NotificationType(str, Enum):
    REMINDER = "reminder"
    ALERT = "alert"
    UPDATE = "update"

class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    status: str = "unread"
    metadata: Optional[Dict] = None
```

</details>

#### ✅ Example

```bash
curl -X POST "$URL/notifications/" \
-H "Content-Type: application/json" \
-d '{"user_id":"test123","type":"reminder","title":"Meeting Reminder","message":"Team meeting at 2 PM","status":"unread","metadata":{}}'
```

<details>
<summary>Response</summary>

```json
{
  "id": "notification_id",
  "user_id": "test123",
  "type": "reminder",
  "title": "Meeting Reminder",
  "message": "Team meeting at 2 PM",
  "status": "unread",
  "metadata": {},
  "created_at": "2025-05-21T02:43:00Z"
}
```

</details>

---

#### 📥 Get User Notifications

* **Endpoint:** `GET /notifications/{user_id}`

```bash
curl -X GET "$URL/notifications/test123"
```

---

#### 🔍 Get Notifications by Type

* **Endpoint:** `GET /notifications/{user_id}/type/{notification_type}`

```bash
curl -X GET "$URL/notifications/test123/type/reminder"
```

---

#### 🔁 Update Notification

* **Endpoint:** `PATCH /notifications/{notification_id}`

```bash
curl -X PATCH "$URL/notifications/notification_id" \
-H "Content-Type: application/json" \
-d '{"status":"read"}'
```

---

#### ❌ Delete Notification

* **Endpoint:** `DELETE /notifications/{notification_id}`

```bash
curl -X DELETE "$URL/notifications/notification_id"
```

---

### 👥 3. Notification Groups

#### ➕ Create Group

* **Endpoint:** `POST /notification-groups/`

```bash
curl -X POST "$URL/notification-groups/" \
-H "Content-Type: application/json" \
-d '{"name":"Team Updates","description":"Notifications for team-related updates"}'
```

---

#### 📂 Get Groups

* **Endpoint:** `GET /notification-groups/`

```bash
curl -X GET "$URL/notification-groups/"
```

---

#### 👤 Add Group Member

* **Endpoint:** `POST /notification-groups/members/`

```bash
curl -X POST "$URL/notification-groups/members/" \
-H "Content-Type: application/json" \
-d '{"college_id":"college123","group_id":"group_id"}'
```

---

### 🛎️ 4. Notification Preferences

#### ➕ Create Preference

* **Endpoint:** `POST /notification-preferences/`

```bash
curl -X POST "$URL/notification-preferences/" \
-H "Content-Type: application/json" \
-d '{"user_id":"test123","group_id":"group_id","email_enabled":true,"in_app_enabled":true,"frequency":"immediate","quiet_hours_start":"23:00","quiet_hours_end":"07:00"}'
```

---

#### 🔍 Get User Preferences

* **Endpoint:** `GET /notification-preferences/{user_id}`

```bash
curl -X GET "$URL/notification-preferences/test123"
```

---

## 🔌 WebSocket Connections

### 📡 Connect to WebSocket

```js
const ws = new WebSocket(`ws://your-api-url/ws/notifications/test123`);
ws.onmessage = (event) => {
    console.log('Received:', JSON.parse(event.data));
};
```

---

## 🧱 Data Models

### 🔔 Notification

```python
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

class Notification(NotificationBase):
    id: str
    created_at: datetime
```

### 👥 Notification Group

```python
class NotificationGroup(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime
```

### ⚙️ Notification Preference

```python
class NotificationPreference(BaseModel):
    id: str
    user_id: str
    group_id: str
    email_enabled: bool = True
    in_app_enabled: bool = True
    frequency: str = "immediate"
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    created_at: datetime
```

---

## 🚨 Error Handling

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 404  | Not Found             |
| 422  | Unprocessable Entity  |
| 500  | Internal Server Error |

---

## 🧪 Testing

### ⚙️ Set Base URL

```bash
URL=$(minikube service notification-service --url)
```

Use this `$URL` in all examples above.

---

## 📘 Swagger UI

Access interactive API docs at:

```url
http://<your-api-url>/docs
```

---

## 🧭 Monitoring and Debugging (Kubernetes)

```bash
kubectl get pods
kubectl get services
kubectl get deployments
kubectl logs -l app=notification-service
```

---

