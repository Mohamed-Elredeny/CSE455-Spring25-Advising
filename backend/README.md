### API Schema
The API schema defines the structure of the Notification Manager API, including endpoints, methods, request/response formats, and status codes. We’ll use OpenAPI (Swagger) conventions since FastAPI automatically generates an OpenAPI schema (accessible at `http://127.0.0.1:8000/docs`).

#### API Overview
- **Base URL**: `http://127.0.0.1:8000` (or your production URL)
- **Title**: Notification Manager API
- **Description**: A RESTful API for managing notifications in an advising application, integrated with MongoDB Atlas for persistence.
- **Version**: 1.0.0

#### Endpoints
Below is the detailed schema for each endpoint.

##### 1. **Create a Notification**
- **Endpoint**: `/notifications/`
- **Method**: `POST`
- **Description**: Creates a new notification for a user.
- **Request**:
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "user_id": "string",          // Required: ID of the user receiving the notification
      "type": "string",             // Required: Type of notification ("reminder", "alert", "update")
      "message": "string",          // Required: The notification message content
      "metadata": "object"          // Optional: Additional metadata (e.g., {"session_id": "123"})
    }
    ```
  - **Example**:
    ```json
    {
      "user_id": "student123",
      "type": "reminder",
      "message": "Your advising session is tomorrow at 10 AM",
      "metadata": { "session_id": "123" }
    }
    ```
- **Responses**:
  - **201 Created**:
    - **Description**: Notification created successfully.
    - **Body**:
      ```json
      {
        "user_id": "string",
        "type": "string",
        "message": "string",
        "status": "string",       // Default: "unread"
        "metadata": "object|null",
        "id": "string",           // Generated UUID
        "created_at": "string"    // ISO 8601 timestamp (e.g., "2025-03-16T12:34:56.789Z")
      }
      ```
    - **Example**:
      ```json
      {
        "user_id": "student123",
        "type": "reminder",
        "message": "Your advising session is tomorrow at 10 AM",
        "status": "unread",
        "metadata": { "session_id": "123" },
        "id": "71cffaba-49e1-4937-8384-7880319aab07",
        "created_at": "2025-03-16T12:34:56.789Z"
      }
      ```
  - **422 Unprocessable Entity**:
    - **Description**: Invalid input (e.g., missing required fields or invalid `type`).
    - **Body**:
      ```json
      {
        "detail": [
          {
            "type": "missing",
            "loc": ["body", "user_id"],
            "msg": "Field required",
            "input": null
          }
        ]
      }
      ```

##### 2. **Get Notifications for a User**
- **Endpoint**: `/notifications/{user_id}`
- **Method**: `GET`
- **Description**: Retrieves all notifications for a specific user.
- **Parameters**:
  - **Path**:
    - `user_id` (string, required): The ID of the user whose notifications are being retrieved.
- **Responses**:
  - **200 OK**:
    - **Description**: List of notifications for the user.
    - **Body**:
      ```json
      [
        {
          "user_id": "string",
          "type": "string",
          "message": "string",
          "status": "string",
          "metadata": "object|null",
          "id": "string",
          "created_at": "string"
        }
      ]
      ```
    - **Example**:
      ```json
      [
        {
          "user_id": "student123",
          "type": "reminder",
          "message": "Your advising session is tomorrow at 10 AM",
          "status": "unread",
          "metadata": { "session_id": "123" },
          "id": "71cffaba-49e1-4937-8384-7880319aab07",
          "created_at": "2025-03-16T12:34:56.789Z"
        }
      ]
      ```
  - **404 Not Found**:
    - **Description**: No notifications found for the user (returns an empty list `[]`).

##### 3. **Get Notifications by Type**
- **Endpoint**: `/notifications/{user_id}/type/{notification_type}`
- **Method**: `GET`
- **Description**: Retrieves notifications for a user filtered by type.
- **Parameters**:
  - **Path**:
    - `user_id` (string, required): The ID of the user.
    - `notification_type` (string, required): The type of notification to filter by ("reminder", "alert", "update").
- **Responses**:
  - **200 OK**:
    - **Description**: List of notifications matching the user and type.
    - **Body**:
      ```json
      [
        {
          "user_id": "string",
          "type": "string",
          "message": "string",
          "status": "string",
          "metadata": "object|null",
          "id": "string",
          "created_at": "string"
        }
      ]
      ```
    - **Example**:
      ```json
      [
        {
          "user_id": "student123",
          "type": "reminder",
          "message": "Your advising session is tomorrow at 10 AM",
          "status": "unread",
          "metadata": { "session_id": "123" },
          "id": "71cffaba-49e1-4937-8384-7880319aab07",
          "created_at": "2025-03-16T12:34:56.789Z"
        }
      ]
      ```
  - **422 Unprocessable Entity**:
    - **Description**: Invalid `notification_type` (not one of "reminder", "alert", "update").
    - **Body**:
      ```json
      {
        "detail": [
          {
            "type": "enum",
            "loc": ["path", "notification_type"],
            "msg": "Input should be 'reminder', 'alert', or 'update'",
            "input": "invalid_type"
          }
        ]
      }
      ```

##### 4. **Update Notification Status**
- **Endpoint**: `/notifications/{notification_id}`
- **Method**: `PATCH`
- **Description**: Updates the status of a specific notification.
- **Parameters**:
  - **Path**:
    - `notification_id` (string, required): The ID of the notification to update.
  - **Body**:
    ```json
    {
      "status": "string"  // Required: New status ("unread", "read", "dismissed")
    }
    ```
  - **Example**:
    ```json
    {
      "status": "read"
    }
    ```
- **Responses**:
  - **200 OK**:
    - **Description**: Notification status updated successfully.
    - **Body**:
      ```json
      {
        "message": "Notification updated"
      }
      ```
  - **400 Bad Request**:
    - **Description**: Invalid status value.
    - **Body**:
      ```json
      {
        "detail": "Invalid status"
      }
      ```
  - **404 Not Found**:
    - **Description**: Notification with the given ID not found.
    - **Body**:
      ```json
      {
        "detail": "Notification not found"
      }
      ```
  - **422 Unprocessable Entity**:
    - **Description**: Missing or invalid input.
    - **Body**:
      ```json
      {
        "detail": [
          {
            "type": "missing",
            "loc": ["body", "status"],
            "msg": "Field required",
            "input": null
          }
        ]
      }
      ```

##### 5. **Delete a Notification**
- **Endpoint**: `/notifications/{notification_id}`
- **Method**: `DELETE`
- **Description**: Deletes a specific notification.
- **Parameters**:
  - **Path**:
    - `notification_id` (string, required): The ID of the notification to delete.
- **Responses**:
  - **200 OK**:
    - **Description**: Notification deleted successfully.
    - **Body**:
      ```json
      {
        "message": "Notification deleted"
      }
      ```
  - **404 Not Found**:
    - **Description**: Notification with the given ID not found.
    - **Body**:
      ```json
      {
        "detail": "Notification not found"
      }
      ```

---

### Detailed Documentation
Below is a comprehensive developer guide for the Notification Manager API.

#### 1. Introduction
The Notification Manager API is a RESTful service designed for an advising application to manage notifications for users (e.g., students, advisors). It allows creating, retrieving, updating, and deleting notifications, with integration to MongoDB Atlas for persistent storage. The API is built using **FastAPI**, providing automatic OpenAPI documentation and validation.

#### 2. Getting Started
##### 2.1 Prerequisites
- **Python**: Version 3.8 or higher.
- **MongoDB Atlas**: A configured cluster with the connection string (e.g., `mongodb+srv://nova:<password>@cluster0.m1y8tvk.mongodb.net/`).
- **Dependencies**: Install required Python packages listed in `requirements.txt`:
  ```
  fastapi==0.110.0
  uvicorn==0.29.0
  motor==3.4.0
  pymongo==4.6.3
  pydantic==2.6.4
  python-decouple==3.8
  ```

##### 2.2 Setup
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Set Up a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   - Create a `.env` file in the `backend` directory:
     ```
     MONGO_URI=mongodb+srv://nova:<your-password>@cluster0.m1y8tvk.mongodb.net/?retryWrites=true&w=majority
     DATABASE_NAME=advising_app
     ```
   - Replace `<your-password>` with the actual password for the `nova` user.

5. **Run the Server**:
   ```bash
   uvicorn main:app --reload
   ```
   - The API will be available at `http://127.0.0.1:8000`.
   - Access the interactive API documentation at `http://127.0.0.1:8000/docs`.

#### 3. Authentication
- **Current State**: The API does not currently enforce authentication. All endpoints are publicly accessible.
- **Recommendation**: Add JWT or OAuth2 authentication to secure endpoints. FastAPI provides built-in support for this via `fastapi.security`.

#### 4. API Endpoints
See the **API Schema** section above for detailed endpoint descriptions, request/response formats, and examples.

#### 5. Data Models
##### 5.1 Notification Model
- **Schema** (defined in `models/notification.py`):
  ```python
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
          from_attributes = True
          json_encoders = {
              datetime: lambda v: v.isoformat()
          }
  ```
- **Fields**:
  - `user_id`: The ID of the user associated with the notification.
  - `type`: The type of notification (`reminder`, `alert`, `update`).
  - `message`: The content of the notification.
  - `status`: The status of the notification (`unread`, `read`, `dismissed`).
  - `metadata`: Optional metadata for additional context.
  - `id`: A unique identifier (UUID) for the notification.
  - `created_at`: Timestamp of when the notification was created.

##### 5.2 Update Notification Model
- **Schema** (defined in `main.py`):
  ```python
  class UpdateNotification(BaseModel):
      status: str
  ```
- **Fields**:
  - `status`: The new status to set for the notification (`unread`, `read`, `dismissed`).

#### 6. Error Handling
- The API uses FastAPI’s built-in error handling to return meaningful error responses.
- Common HTTP status codes:
  - `200 OK`: Request successful.
  - `201 Created`: Resource created successfully.
  - `400 Bad Request`: Invalid input (e.g., wrong status value).
  - `404 Not Found`: Resource not found (e.g., notification ID doesn’t exist).
  - `422 Unprocessable Entity`: Validation error (e.g., missing required fields).
  - `500 Internal Server Error`: Server-side error (e.g., database connection failure).

#### 7. Integration with MongoDB Atlas
- **Connection**: The API connects to MongoDB Atlas using the `MONGO_URI` specified in `.env`.
- **Database**: Uses the `advising_app` database with a `notifications` collection.
- **Connection Check**: On startup, the API verifies connectivity to Atlas using the `check_connection()` function.

#### 8. Testing the API
##### 8.1 Using Swagger UI
- Open `http://127.0.0.1:8000/docs` to access the interactive API documentation.
- Test each endpoint by entering the required parameters and body, then clicking "Execute."

##### 8.2 Using `curl`
- **Create Notification**:
  ```bash
  curl -X POST "http://127.0.0.1:8000/notifications/" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "student123", "type": "reminder", "message": "Your advising session is tomorrow at 10 AM"}'
  ```
- **Get Notifications**:
  ```bash
  curl "http://127.0.0.1:8000/notifications/student123"
  ```
- **Get Notifications by Type**:
  ```bash
  curl "http://127.0.0.1:8000/notifications/student123/type/reminder"
  ```
- **Update Notification**:
  ```bash
  curl -X PATCH "http://127.0.0.1:8000/notifications/<notification-id>" \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
  ```
- **Delete Notification**:
  ```bash
  curl -X DELETE "http://127.0.0.1:8000/notifications/<notification-id>"
  ```

#### 9. Best Practices
- **Input Validation**: Always validate input data (e.g., ensure `type` and `status` are valid enum values).
- **Error Handling**: Handle errors gracefully and return meaningful messages.
- **Security**: Add authentication and authorization for production use.
- **Logging**: Implement logging for debugging and monitoring (e.g., using Python’s `logging` module).
- **Rate Limiting**: Consider adding rate limiting to prevent abuse (e.g., using `slowapi` with FastAPI).

#### 10. Future Improvements
- **Authentication**: Secure the API with JWT or OAuth2.
- **Real-Time Notifications**: Implement WebSockets for real-time updates using `fastapi-websocket`.
- **Pagination**: Add pagination to the `GET` endpoints for better performance with large datasets.
- **Advanced Filtering**: Allow filtering by status, date range, etc., in the `GET` endpoints.

#### 11. Contact
- For support or contributions, contact the development team at `<your-email>` or `<your-repository>`.

---

### Generate OpenAPI Schema (Optional)
FastAPI automatically generates an OpenAPI schema for your API, which you can access in JSON format at `http://127.0.0.1:8000/openapi.json`. You can also customize the schema by adding descriptions and examples in your endpoint definitions using FastAPI’s `description`, `response_description`, and `responses` parameters.

Example of adding descriptions to an endpoint:
```python
@app.post(
    "/notifications/",
    response_model=Notification,
    summary="Create a new notification",
    description="Creates a new notification for a user and stores it in MongoDB Atlas.",
    responses={
        201: {"description": "Notification created successfully"},
        422: {"description": "Invalid input"}
    }
)
async def create_notification(notification: NotificationCreate):
    notification_dict = notification.dict()
    notification_dict["id"] = str(uuid.uuid4())
    notification_dict["created_at"] = datetime.utcnow()
    await notification_collection.insert_one(notification_dict)
    return notification_dict
```

---
