# Advising Service API Documentation

## Base URL
```
http://advising-service:8000/api
```

## Authentication
All endpoints except `/auth/login` and `/auth/register` require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Health Checks
### Health Check
```http
GET /health
```
Response:
```json
{
    "status": "healthy"
}
```

### Readiness Check
```http
GET /ready
```
Response:
```json
{
    "status": "ready"
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```
Request Body:
```json
{
    "username": "student1",
    "password": "password123",
    "role": "student"  // or "advisor"
}
```
Response (201 Created):
```json
{
    "message": "User registered successfully",
    "user_id": "user123"
}
```

### Login
```http
POST /auth/login
```
Request Body:
```json
{
    "username": "student1",
    "password": "password123"
}
```
Response:
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
}
```

## Appointment Endpoints

### Get All Appointments
```http
GET /appointments
```
Query Parameters:
- `timezone` (optional): Timezone for date conversion (e.g., "America/New_York")

Response:
```json
[
    {
        "_id": "appt123",
        "student_id": "student1",
        "advisor_id": "advisor1",
        "date_time": "2024-03-20T14:30:00Z",
        "status": "pending",
        "reason": "Course selection discussion"
    }
]
```

### Book Appointment
```http
POST /appointments
```
Request Body:
```json
{
    "student_id": "student1",
    "advisor_id": "advisor1",
    "date_time": "2024-03-20T14:30:00Z",
    "reason": "Course selection discussion",
    "timezone": "America/New_York"
}
```
Response (201 Created):
```json
{
    "message": "Appointment booked successfully!",
    "id": "appt123"
}
```

### Get Appointment by ID
```http
GET /appointments/{appointment_id}
```
Response:
```json
{
    "_id": "appt123",
    "student_id": "student1",
    "advisor_id": "advisor1",
    "date_time": "2024-03-20T14:30:00Z",
    "status": "pending",
    "reason": "Course selection discussion"
}
```

### Update Appointment
```http
PUT /appointments/{appointment_id}
```
Request Body:
```json
{
    "date_time": "2024-03-21T15:00:00Z",
    "reason": "Updated course selection discussion"
}
```
Response:
```json
{
    "message": "Appointment updated successfully"
}
```

### Delete Appointment
```http
DELETE /appointments/{appointment_id}
```
Response:
```json
{
    "message": "Appointment deleted",
    "deleted_count": 1
}
```

### Confirm Appointment
```http
POST /appointments/{appointment_id}/confirm
```
Response:
```json
{
    "message": "Appointment confirmed successfully"
}
```

### Reject Appointment
```http
POST /appointments/{appointment_id}/reject
```
Response:
```json
{
    "message": "Appointment rejected"
}
```

## Analytics Endpoints

### Get Analytics Summary
```http
GET /analytics/summary
```
Response:
```json
{
    "total_appointments": 100,
    "upcoming": 30,
    "completed": 70,
    "completion_rate": 70.0
}
```

### Get Advisor Performance
```http
GET /analytics/advisor-performance
```
Response:
```json
{
    "advisors": [
        {
            "_id": "advisor1",
            "total_appointments": 50,
            "completed": 40,
            "completion_rate": 80.0
        }
    ]
}
```

## Example cURL Commands

### Login
```bash
curl -X POST http://advising-service:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "password123"}'
```

### Book Appointment
```bash
curl -X POST http://advising-service:8000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "student_id": "student1",
    "advisor_id": "advisor1",
    "date_time": "2024-03-20T14:30:00Z",
    "reason": "Course selection discussion"
  }'
```

### Get All Appointments
```bash
curl -X GET http://advising-service:8000/api/appointments \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
    "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
    "detail": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
    "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "detail": "Internal server error"
}
``` 