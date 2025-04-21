# API Documentation

## Base URL
All API endpoints are prefixed with `/api/v1`

## Authentication
Currently, the API does not require authentication. This may change in future versions.

## Error Handling
All error responses follow this format:
```json
{
  "status_code": "integer",
  "message": "string",
  "details": {
    "error": "string",
    // Additional error-specific details
  }
}
```

## Endpoints

### Categories

- [Create Category](categories.md#create-category)
- [Get All Categories](categories.md#get-all-categories)
- [Get Category by ID](categories.md#get-category-by-id)
- [Update Category](categories.md#update-category)
- [Delete Category](categories.md#delete-category)

### Courses

- [Create Course](courses.md#create-course)
- [Get All Courses](courses.md#get-all-courses)
- [Get Course by ID](courses.md#get-course-by-id)
- [Update Course](courses.md#update-course)
- [Search Courses](courses.md#search-courses)
- [Get Courses by Category](courses.md#get-courses-by-category)
- [Get Core Courses](courses.md#get-core-courses)
- [Get Courses by Level](courses.md#get-courses-by-level)
- [Get Course Dependencies](courses.md#get-course-dependencies)

### Sections

- [Get Course Sections](sections.md#get-course-sections)
- [Get Section by ID](sections.md#get-section-by-id)

## Data Models

### Category
```json
{
  "id": "integer",
  "name": "string",
  "description": "string"
}
```

### Course
```json
{
  "course_id": "string",
  "title": "string",
  "description": "string",
  "instructor": "string",
  "credits": "integer",
  "department": "string",
  "is_core": "boolean",
  "level": "integer",
  "prerequisites": ["string"],
  "categories": ["string"],
  "sections": [
    {
      "id": "integer",
      "section_id": "string",
      "instructor": "string",
      "capacity": "integer",
      "schedule_day": "string",
      "schedule_time": "string",
      "course_id": "string"
    }
  ]
}
```

### Section
```json
{
  "id": "integer",
  "section_id": "string",
  "instructor": "string",
  "capacity": "integer",
  "schedule_day": "string",
  "schedule_time": "string",
  "course_id": "string"
}
```

## Rate Limiting
Currently, there is no rate limiting implemented. This may change in future versions.

## Versioning
The API is versioned through the URL path. The current version is v1.

## Pagination
All list endpoints support pagination through the following query parameters:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

## Examples

### Creating a Course
```bash
curl -X POST "http://localhost:8000/api/v1/courses/" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "CS101",
    "title": "Introduction to Computer Science",
    "description": "Basic concepts of computer science",
    "instructor": "John Doe",
    "credits": 4,
    "department": "CS",
    "is_core": true,
    "level": 100,
    "prerequisites": [],
    "categories": ["Core", "Introductory"],
    "sections": [
      {
        "section_id": "CS101-A",
        "instructor": "John Doe",
        "capacity": 30,
        "schedule_day": "Monday",
        "schedule_time": "10:00-11:30"
      }
    ]
  }'
```

### Searching Courses
```bash
curl "http://localhost:8000/api/v1/courses/search/?query=computer&search_by=title"
```

For detailed information about each endpoint, please refer to the specific documentation files linked above. 