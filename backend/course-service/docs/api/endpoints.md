# Course Service API Documentation

This document outlines the API endpoints provided by the Course Service microservice.

## Base URL

When deployed in Kubernetes: `http://course-service` (internal cluster DNS)

## Authentication

This service doesn't handle authentication directly. Authentication should be managed by an API Gateway or Identity service.

## Endpoints

### Courses

#### List All Courses

```
GET /courses/
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `category_id` (integer, optional): Filter by category ID
- `search` (string, optional): Search courses by title or description

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Introduction to Computer Science",
      "description": "Fundamentals of computer science",
      "credits": 4,
      "department": "CSE",
      "course_number": "142",
      "category_id": 1,
      "created_at": "2023-09-15T14:30:00",
      "updated_at": "2023-09-15T14:30:00"
    },
    // ...more courses
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}
```

**Example Request:**
```bash
curl -X GET "http://course-service/courses/?limit=10&category_id=1"
```

#### Get Course by ID

```
GET /courses/{course_id}
```

**Path Parameters:**
- `course_id` (integer, required): ID of the course to retrieve

**Response:**
```json
{
  "id": 1,
  "title": "Introduction to Computer Science",
  "description": "Fundamentals of computer science",
  "credits": 4,
  "department": "CSE",
  "course_number": "142",
  "category_id": 1,
  "created_at": "2023-09-15T14:30:00",
  "updated_at": "2023-09-15T14:30:00"
}
```

**Example Request:**
```bash
curl -X GET "http://course-service/courses/1"
```

#### Create New Course

```
POST /courses/
```

**Request Body:**
```json
{
  "title": "Advanced Algorithms",
  "description": "Study of advanced algorithmic techniques",
  "credits": 4,
  "department": "CSE",
  "course_number": "421",
  "category_id": 2
}
```

**Response:**
```json
{
  "id": 10,
  "title": "Advanced Algorithms",
  "description": "Study of advanced algorithmic techniques",
  "credits": 4,
  "department": "CSE",
  "course_number": "421",
  "category_id": 2,
  "created_at": "2023-09-15T14:30:00",
  "updated_at": "2023-09-15T14:30:00"
}
```

**Example Request:**
```bash
curl -X POST "http://course-service/courses/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Algorithms",
    "description": "Study of advanced algorithmic techniques",
    "credits": 4,
    "department": "CSE",
    "course_number": "421",
    "category_id": 2
  }'
```

#### Update Course

```
PUT /courses/{course_id}
```

**Path Parameters:**
- `course_id` (integer, required): ID of the course to update

**Request Body:**
```json
{
  "title": "Advanced Algorithms",
  "description": "Updated description for advanced algorithms",
  "credits": 5,
  "department": "CSE",
  "course_number": "421",
  "category_id": 2
}
```

**Response:**
```json
{
  "id": 10,
  "title": "Advanced Algorithms",
  "description": "Updated description for advanced algorithms",
  "credits": 5,
  "department": "CSE",
  "course_number": "421",
  "category_id": 2,
  "created_at": "2023-09-15T14:30:00",
  "updated_at": "2023-09-15T16:45:00"
}
```

**Example Request:**
```bash
curl -X PUT "http://course-service/courses/10" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Algorithms",
    "description": "Updated description for advanced algorithms",
    "credits": 5,
    "department": "CSE",
    "course_number": "421",
    "category_id": 2
  }'
```

#### Delete Course

```
DELETE /courses/{course_id}
```

**Path Parameters:**
- `course_id` (integer, required): ID of the course to delete

**Response:**
```json
{
  "message": "Course deleted successfully"
}
```

**Example Request:**
```bash
curl -X DELETE "http://course-service/courses/10"
```

### Course Sections

#### List Sections for a Course

```
GET /courses/{course_id}/sections
```

**Path Parameters:**
- `course_id` (integer, required): ID of the course

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `quarter` (string, optional): Filter by academic quarter (e.g., "Fall 2023")

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "section_number": "A",
      "instructor": "John Doe",
      "schedule": "MWF 10:30-11:20",
      "location": "CSE 142",
      "capacity": 120,
      "enrolled": 98,
      "waitlist": 5,
      "quarter": "Fall 2023",
      "created_at": "2023-09-15T14:30:00",
      "updated_at": "2023-09-15T14:30:00"
    },
    // ...more sections
  ],
  "total": 3,
  "skip": 0,
  "limit": 10
}
```

**Example Request:**
```bash
curl -X GET "http://course-service/courses/1/sections?quarter=Fall%202023"
```

### Categories

#### List All Categories

```
GET /categories/
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Computer Science",
      "description": "Courses related to computer science",
      "created_at": "2023-09-15T14:30:00",
      "updated_at": "2023-09-15T14:30:00"
    },
    // ...more categories
  ],
  "total": 10,
  "skip": 0,
  "limit": 10
}
```

**Example Request:**
```bash
curl -X GET "http://course-service/categories/"
```

## Testing Load Balancing

To verify load balancing across multiple pods, you can use:

```bash
# Run this in a loop to see requests distributed across pods
for i in {1..10}; do
  kubectl exec -it curl-test -- curl http://course-service/
done
```

Expected output will show different pod names handling requests, demonstrating the load balancing.

## Health Endpoints

The service includes health endpoints for Kubernetes probes:

```
GET /
```

Returns basic service information and health status. 