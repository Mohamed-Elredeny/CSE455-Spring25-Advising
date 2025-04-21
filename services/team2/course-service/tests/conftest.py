import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.database import Base, get_db
from app.main import app
from app.models.models import Course, Section, prerequisite_association, Category, program_category

# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")

@pytest.fixture(scope="function")
def db_session(test_engine):
    """Create a fresh database session for each test."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    # Connect to database
    connection = test_engine.connect()
    transaction = connection.begin()
    
    # Create a session
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    # Clean up after test
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with the test database session."""
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass
    
    # Override the get_db dependency
    app.dependency_overrides[get_db] = _get_test_db
    
    with TestClient(app) as client:
        yield client
    
    # Reset the dependency override
    app.dependency_overrides = {}

@pytest.fixture
def sample_course_data():
    """Sample course data for tests."""
    return {
        "course_id": "CS101",
        "title": "Introduction to Computer Science",
        "description": "An introductory course to computer science",
        "instructor": "John Doe",
        "credits": 3,
        "department": "Computer Science",
        "is_core": True,
        "level": 100,
        "prerequisites": [],
        "categories": [],
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

@pytest.fixture
def sample_category_data():
    """Sample category data for tests."""
    return {
        "name": "Core Computer Science",
        "description": "Foundational courses in computer science"
    }

@pytest.fixture
def sample_section_data():
    """Sample section data for tests."""
    return {
        "section_id": "CS101-B",
        "instructor": "Jane Smith",
        "schedule_day": "Wednesday",
        "schedule_time": "2:00 PM",
        "capacity": 25
    }

@pytest.fixture
def create_sample_course(db_session, sample_course_data):
    """Create a sample course in the database."""
    # Create course
    course = Course(
        course_id=sample_course_data["course_id"],
        title=sample_course_data["title"],
        description=sample_course_data["description"],
        instructor=sample_course_data["instructor"],
        credits=sample_course_data["credits"],
        department=sample_course_data["department"],
        is_core=sample_course_data.get("is_core", False),
        level=sample_course_data.get("level", None)
    )
    db_session.add(course)
    
    # Create section
    section_data = sample_course_data["sections"][0]
    section = Section(
        section_id=section_data["section_id"],
        instructor=section_data["instructor"],
        schedule_day=section_data["schedule_day"],
        schedule_time=section_data["schedule_time"],
        capacity=section_data["capacity"],
        course_id=sample_course_data["course_id"]
    )
    db_session.add(section)
    
    db_session.commit()
    db_session.refresh(course)
    
    return course

@pytest.fixture
def create_sample_category(db_session, sample_category_data):
    """Create a sample category in the database."""
    category = Category(
        name=sample_category_data["name"],
        description=sample_category_data["description"]
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category

@pytest.fixture
def create_multiple_courses(db_session):
    """Create multiple courses for testing list/search functionality."""
    courses = [
        Course(
            course_id="CS101",
            title="Introduction to Computer Science",
            description="An introductory course to computer science",
            instructor="John Doe",
            credits=3,
            department="Computer Science",
            is_core=True,
            level=100
        ),
        Course(
            course_id="CS201",
            title="Data Structures",
            description="Course on data structures",
            instructor="Jane Smith",
            credits=4,
            department="Computer Science",
            is_core=True,
            level=200
        ),
        Course(
            course_id="MATH101",
            title="Calculus I",
            description="Introduction to calculus",
            instructor="Robert Johnson",
            credits=3,
            department="Mathematics",
            is_core=True,
            level=100
        )
    ]
    
    for course in courses:
        db_session.add(course)
    
    # Add prerequisite relationship
    db_session.commit()
    
    # CS201 has CS101 as a prerequisite
    db_session.execute(
        prerequisite_association.insert().values(
            course_id="CS201",
            prerequisite_id="CS101"
        )
    )
    
    db_session.commit()
    
    return courses

@pytest.fixture
def create_multiple_categories(db_session):
    """Create multiple categories for testing."""
    categories = [
        Category(name="Core", description="Core curriculum courses"),
        Category(name="Elective", description="Elective courses"),
        Category(name="Programming", description="Programming-focused courses"),
        Category(name="Theory", description="Theoretical computer science courses")
    ]
    
    for category in categories:
        db_session.add(category)
    
    db_session.commit()
    
    # Add courses to categories
    db_session.execute(
        program_category.insert().values(
            course_id="CS101",
            category_id=categories[0].id  # Core
        )
    )
    
    db_session.execute(
        program_category.insert().values(
            course_id="CS101",
            category_id=categories[2].id  # Programming
        )
    )
    
    db_session.execute(
        program_category.insert().values(
            course_id="CS201",
            category_id=categories[0].id  # Core
        )
    )
    
    db_session.execute(
        program_category.insert().values(
            course_id="CS201",
            category_id=categories[2].id  # Programming
        )
    )
    
    db_session.commit()
    
    return categories 