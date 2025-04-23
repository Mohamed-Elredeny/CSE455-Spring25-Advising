# Testing Guide

## Overview

The CSE455-Spring25-Advising service uses pytest for testing. The testing strategy includes:

- Unit tests
- Integration tests
- End-to-end tests
- Database tests

## Test Structure

```
tests/
├── conftest.py           # Test configuration and fixtures
├── test_courses.py       # Course-related tests
├── test_categories.py    # Category-related tests
├── test_sections.py      # Section-related tests
├── test_database.py      # Database tests
├── test_schemas.py       # Schema validation tests
└── test_integration.py   # Integration tests
```

## Running Tests

### Basic Test Execution

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_courses.py

# Run specific test function
pytest tests/test_courses.py::test_create_course

# Run with coverage
pytest --cov=app
```

### Test Configuration

The `conftest.py` file contains common test fixtures and configuration:

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
```

## Test Categories

### 1. Unit Tests

Unit tests focus on testing individual components in isolation:

```python
def test_create_course(client, db_session):
    response = client.post(
        "/api/v1/courses/",
        json={
            "course_id": "CS101",
            "title": "Test Course",
            "description": "Test Description",
            "instructor": "Test Instructor",
            "credits": 4,
            "department": "CS",
            "is_core": True,
            "level": 100
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["course_id"] == "CS101"
```

### 2. Integration Tests

Integration tests verify the interaction between components:

```python
def test_course_with_sections(client, db_session):
    # Create course
    course_response = client.post(
        "/api/v1/courses/",
        json={
            "course_id": "CS101",
            "title": "Test Course",
            "description": "Test Description",
            "instructor": "Test Instructor",
            "credits": 4,
            "department": "CS",
            "is_core": True,
            "level": 100,
            "sections": [
                {
                    "section_id": "CS101-A",
                    "instructor": "Test Instructor",
                    "capacity": 30,
                    "schedule_day": "Monday",
                    "schedule_time": "10:00-11:30"
                }
            ]
        }
    )
    assert course_response.status_code == 201
    
    # Get sections
    sections_response = client.get("/api/v1/courses/CS101/sections/")
    assert sections_response.status_code == 200
    data = sections_response.json()
    assert len(data) == 1
    assert data[0]["section_id"] == "CS101-A"
```

### 3. Database Tests

Database tests verify database operations and constraints:

```python
def test_course_unique_constraint(client, db_session):
    # Create first course
    client.post(
        "/api/v1/courses/",
        json={
            "course_id": "CS101",
            "title": "Test Course",
            "description": "Test Description",
            "instructor": "Test Instructor",
            "credits": 4,
            "department": "CS",
            "is_core": True,
            "level": 100
        }
    )
    
    # Try to create duplicate course
    response = client.post(
        "/api/v1/courses/",
        json={
            "course_id": "CS101",
            "title": "Duplicate Course",
            "description": "Duplicate Description",
            "instructor": "Duplicate Instructor",
            "credits": 4,
            "department": "CS",
            "is_core": True,
            "level": 100
        }
    )
    assert response.status_code == 409
```

### 4. Schema Tests

Schema tests verify data validation:

```python
def test_course_schema_validation():
    # Valid data
    valid_data = {
        "course_id": "CS101",
        "title": "Test Course",
        "description": "Test Description",
        "instructor": "Test Instructor",
        "credits": 4,
        "department": "CS",
        "is_core": True,
        "level": 100
    }
    course = CourseCreate(**valid_data)
    assert course.course_id == "CS101"
    
    # Invalid data
    invalid_data = {
        "course_id": "CS101",
        "title": "Test Course",
        "description": "Test Description",
        "instructor": "Test Instructor",
        "credits": -1,  # Invalid credits
        "department": "CS",
        "is_core": True,
        "level": 100
    }
    with pytest.raises(ValueError):
        CourseCreate(**invalid_data)
```

## Test Best Practices

1. **Isolation**
   - Each test should be independent
   - Use fixtures for setup and teardown
   - Clean up after each test

2. **Naming Conventions**
   - Test files: `test_*.py`
   - Test functions: `test_*`
   - Fixtures: descriptive names

3. **Assertions**
   - Use specific assertions
   - Include meaningful messages
   - Test both success and failure cases

4. **Coverage**
   - Aim for high test coverage
   - Focus on critical paths
   - Include edge cases

## Mocking

Use mocking for external dependencies:

```python
from unittest.mock import patch

def test_external_service(client, db_session):
    with patch('app.crud.course.external_service') as mock_service:
        mock_service.return_value = {"status": "success"}
        response = client.get("/api/v1/courses/external")
        assert response.status_code == 200
        assert response.json()["status"] == "success"
```

## Continuous Integration

Tests are automatically run in CI:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest --cov=app
```

## Troubleshooting Tests

1. **Database Issues**
   - Check database connection
   - Verify migrations
   - Clean test database

2. **Fixture Issues**
   - Check fixture scope
   - Verify fixture dependencies
   - Clean up resources

3. **Test Failures**
   - Check test isolation
   - Verify test data
   - Review error messages

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction) 