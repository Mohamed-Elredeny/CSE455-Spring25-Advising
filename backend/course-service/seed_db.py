#!/usr/bin/env python
# filepath: /Users/adham/Projects/CSE455-Spring25-Advising/backend/course-service/seed_db.py
import os
import sys
import json
import logging
import argparse
from pathlib import Path
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal, engine
from app.models.models import Base, Course, Section, Category
from app.schemas.schemas import CourseCreate, CategoryCreate, SectionCreate
from app.crud import course as course_crud
from app.crud import category as category_crud

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Define default sample data
CATEGORIES = [
    {"name": "Core", "description": "Core computer science courses"},
    {"name": "Elective", "description": "Elective courses"},
    {"name": "AI", "description": "Artificial Intelligence courses"},
    {"name": "Systems", "description": "Systems and networks courses"},
    {"name": "Theory", "description": "Theoretical computer science"},
    {"name": "Data Science", "description": "Data science and analytics courses"},
]

COURSES = [
    {
        "course_id": "CSE101",
        "title": "Introduction to Computer Science",
        "description": "An introductory course to computer science and programming",
        "instructor": "Dr. John Smith",
        "credits": 4,
        "department": "CSE",
        "is_core": True,
        "level": 100,
        "categories": ["Core"],
        "prerequisites": [],
        "sections": [
            {
                "section_id": "CSE101-A",
                "instructor": "Dr. John Smith",
                "capacity": 50,
                "schedule_day": "Monday",
                "schedule_time": "10:00-11:50"
            },
            {
                "section_id": "CSE101-B",
                "instructor": "Dr. Jane Doe",
                "capacity": 50,
                "schedule_day": "Wednesday",
                "schedule_time": "10:00-11:50"
            }
        ]
    },
    {
        "course_id": "CSE143",
        "title": "Computer Programming II",
        "description": "Advanced programming techniques using Java",
        "instructor": "Dr. Robert Davis",
        "credits": 4,
        "department": "CSE",
        "is_core": True,
        "level": 100,
        "categories": ["Core"],
        "prerequisites": ["CSE142"],
        "sections": [
            {
                "section_id": "CSE143-A",
                "instructor": "Dr. Robert Davis",
                "capacity": 120,
                "schedule_day": "Thursday",
                "schedule_time": "10:00-11:50"
            }
        ]
    },
    {
        "course_id": "CSE455",
        "title": "Computer Vision",
        "description": "Introduction to computer vision algorithms and applications",
        "instructor": "Dr. Maria Rodriguez",
        "credits": 4,
        "department": "CSE",
        "is_core": False,
        "level": 400,
        "categories": ["AI", "Data Science"],
        "prerequisites": ["CSE373"],
        "sections": [
            {
                "section_id": "CSE455-A",
                "instructor": "Dr. Maria Rodriguez",
                "capacity": 60,
                "schedule_day": "Tuesday",
                "schedule_time": "15:00-16:50"
            }
        ]
    }
]


def load_data_from_file(file_path):
    """Load data from a JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading data from file {file_path}: {str(e)}")
        raise


def seed_database(data_file=None, force=False):
    """Seed the database with sample data"""
    db = SessionLocal()
    try:
        # Check if there's already data in the database
        existing_categories = db.query(Category).count()
        existing_courses = db.query(Course).count()
        
        if (existing_categories > 0 or existing_courses > 0) and not force:
            logger.info("Database already contains data. Use --force to override.")
            logger.info(f"Existing categories: {existing_categories}")
            logger.info(f"Existing courses: {existing_courses}")
            return
        
        # If force is true, clear existing data
        if force and (existing_categories > 0 or existing_courses > 0):
            logger.info("Clearing existing data...")
            db.query(Section).delete()
            db.query(Course).delete()
            db.query(Category).delete()
            db.commit()
        
        # Load data from file if provided, otherwise use default data
        if data_file:
            logger.info(f"Loading data from {data_file}")
            data = load_data_from_file(data_file)
            categories_data = data.get('categories', [])
            courses_data = data.get('courses', [])
        else:
            # Use built-in sample data
            default_data_path = Path(__file__).parent / "seed_data" / "sample_data.json"
            if default_data_path.exists():
                logger.info(f"Loading default data from {default_data_path}")
                data = load_data_from_file(default_data_path)
                categories_data = data.get('categories', [])
                courses_data = data.get('courses', [])
            else:
                logger.warning("Default data file not found. Using minimal built-in data.")
                # Use minimal built-in data
                categories_data = CATEGORIES
                courses_data = COURSES
        
        # 1. Create categories first
        logger.info("Seeding categories...")
        for category_data in categories_data:
            category_crud.create_category(db, CategoryCreate(**category_data))
            logger.info(f"Created category: {category_data['name']}")
        
        # 2. Create courses with sections and prerequisites
        logger.info("Seeding courses...")
        for course_data in courses_data:
            # Create a copy of the data to avoid modifying the original
            course_create_data = course_data.copy()
            
            # Create the course
            course = course_crud.create_course(db, CourseCreate(**course_create_data))
            logger.info(f"Created course: {course.course_id} - {course.title}")
        
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description='Seed the database with sample data')
    parser.add_argument('--file', '-f', help='Path to JSON file with seed data')
    parser.add_argument('--force', action='store_true', help='Force overwrite existing data')
    args = parser.parse_args()
    
    logger.info("Starting database seeding process...")
    seed_database(data_file=args.file, force=args.force)


if __name__ == "__main__":
    main()
