# Course Management API

A FastAPI-based CRUD API for managing university courses and sections using PostgreSQL and Docker.

## Features

- CRUD operations for courses and sections
- RESTful API with JSON responses
- SQLAlchemy ORM for database operations
- PostgreSQL database
- Docker Compose setup for easy deployment
- Pydantic schemas for request/response validation
- Comprehensive test suite with pytest
- GitHub Actions for CI/CD

## Project Structure

```
app/
├── __init__.py
├── main.py                 # Main application entry point
├── database/               # Database configuration
│   ├── __init__.py
│   └── database.py
├── models/                 # SQLAlchemy models
│   ├── __init__.py
│   └── models.py
├── schemas/                # Pydantic schemas
│   ├── __init__.py
│   └── schemas.py
├── crud/                   # CRUD operations
│   ├── __init__.py
│   ├── course.py
│   └── section.py
└── routers/                # API routes
    ├── __init__.py
    ├── courses.py
    └── sections.py

tests/                      # Test suite
├── conftest.py             # Test configuration and fixtures
├── test_courses.py         # Tests for course endpoints
├── test_sections.py        # Tests for section endpoints
└── test_integration.py     # Integration tests
```

## Installation

### Using Docker Compose (Recommended)

1. Clone the repository
2. Start the application with Docker Compose:

```bash
docker-compose up -d
```

This will start two containers:
- `course-api`: The FastAPI application
- `course-db`: The PostgreSQL database

The API will be available at http://localhost:8000.

### Manual Installation

1. Clone the repository
2. Install the dependencies:

```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL and update the .env file with your database URL
4. Run the application:

```bash
uvicorn app.main:app --reload
```

## Running Tests

### Local Testing

Run the tests using the provided script:

```bash
./run_tests.sh
```

This will run all tests and generate a coverage report.

### Docker Testing

Run the tests in a Docker container:

```bash
docker-compose -f docker-compose.test.yml up
```

This will start the `course-test-runner` container to execute the tests.

## CI/CD with GitHub Actions

This project uses GitHub Actions for continuous integration and deployment:

### Automated Testing

On every push to the `main` branch and pull requests, the following checks are automatically run:

- Python 3.9 environment setup
- Dependencies installation
- PostgreSQL database setup
- Database migrations
- Pytest execution with coverage reporting

### Deployment

When code is pushed to the `main` branch and all tests pass, the application is:

1. Built as a Docker image
2. Pushed to Docker Hub
3. Ready for deployment to your server (requires configuration)

### GitHub Secrets

To use the deployment workflow, you need to set up the following secrets in your GitHub repository:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

For server deployment (when uncommenting that section):
- `SERVER_IP`: Your server IP address
- `SERVER_USER`: SSH username for your server
- `SSH_PRIVATE_KEY`: SSH private key for authentication

## API Documentation

Once the application is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Docker Hub Integration

This project automatically builds and pushes Docker images to Docker Hub using GitHub Actions. The workflow is triggered by:

- Pushing to the `main` or `master` branch
- Creating tags with pattern `v*` (e.g., v1.0.0)
- Manually running the workflow through GitHub UI

### Setting up GitHub Secrets for Docker Hub

To enable the Docker Hub integration, you must add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token (not your password)

To generate a Docker Hub access token:
1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to Account Settings → Security → New Access Token
3. Create a token with an appropriate description and permissions
4. Copy the token immediately (it won't be shown again)

### Docker Image Tags

The workflow generates several tags for the image:

- Branch name (e.g., `main`, `development`)
- PR number for pull requests
- Semantic version for tags (e.g., `v1.0.0`, `1.0`)
- Short commit SHA

### Using the Docker Image

Once published, you can pull the image from Docker Hub:

```bash
docker pull <username>/cse455-spring25-advising:main
```

Replace `<username>` with your Docker Hub username and adjust the tag as needed.

## API Endpoints

### Courses

- `GET /courses`: List all courses
- `POST /courses`: Create a new course
- `GET /courses/{course_id}`: Get a specific course
- `PUT /courses/{course_id}`: Update a course
- `DELETE /courses/{course_id}`: Delete a course

### Sections

- `GET /courses/{course_id}/sections`: List all sections for a course
- `POST /courses/{course_id}/sections`: Create a new section for a course
- `GET /courses/{course_id}/sections/{section_id}`: Get a specific section
- `PUT /courses/{course_id}/sections/{section_id}`: Update a section
- `DELETE /courses/{course_id}/sections/{section_id}`: Delete a section

## Sample Request

### Create a Course

```json
POST /courses/

{
  "course_id": "CS101",
  "title": "Introduction to Computer Science",
  "description": "An introductory course to computer science",
  "instructor": "John Doe",
  "credits": 3,
  "department": "Computer Science",
  "prerequisites": [],
  "sections": [
    {
      "section_id": "CS101-A",
      "instructor": "John Doe",
      "schedule_day": "Monday",
      "schedule_time": "10:00 AM",
      "capacity": 30
    }
  ]
} 