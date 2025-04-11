import csv
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime

from sqlalchemy.orm import Session
from app.crud import course as course_crud
from app.schemas.course import CourseCreate, CourseUpdate
from app.schemas.section import SectionCreate
from app.models.course import Course
from app.models.section import Section

logger = logging.getLogger(__name__)

class DataImportError(Exception):
    """Custom exception for data import errors"""
    pass

class DataImporter:
    def __init__(self, db: Session):
        self.db = db

    def import_courses_from_csv(self, file_path: str) -> Dict[str, int]:
        """
        Import courses from a CSV file
        Expected CSV format:
        course_code,title,description,credits,prerequisites
        """
        try:
            with open(file_path, 'r') as f:
                reader = csv.DictReader(f)
                return self._process_course_records(reader)
        except Exception as e:
            logger.error(f"Error importing courses from CSV: {str(e)}")
            raise DataImportError(f"Failed to import courses from CSV: {str(e)}")

    def import_courses_from_json(self, file_path: str) -> Dict[str, int]:
        """
        Import courses from a JSON file
        Expected JSON format:
        [
            {
                "course_code": "CSE101",
                "title": "Introduction to Computer Science",
                "description": "...",
                "credits": 4,
                "prerequisites": ["MATH101"]
            }
        ]
        """
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                return self._process_course_records(data)
        except Exception as e:
            logger.error(f"Error importing courses from JSON: {str(e)}")
            raise DataImportError(f"Failed to import courses from JSON: {str(e)}")

    def _process_course_records(self, records: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Process course records and insert/update them in the database
        Returns a dictionary with counts of created and updated records
        """
        created = 0
        updated = 0
        errors = 0

        for record in records:
            try:
                course_data = {
                    "course_code": record["course_code"],
                    "title": record["title"],
                    "description": record.get("description", ""),
                    "credits": int(record.get("credits", 0)),
                    "prerequisites": record.get("prerequisites", [])
                }

                # Check if course exists
                existing_course = course_crud.get_course_by_code(
                    self.db, course_data["course_code"]
                )

                if existing_course:
                    # Update existing course
                    course_crud.update_course(
                        self.db,
                        existing_course.id,
                        CourseUpdate(**course_data)
                    )
                    updated += 1
                else:
                    # Create new course
                    course_crud.create_course(
                        self.db,
                        CourseCreate(**course_data)
                    )
                    created += 1

            except Exception as e:
                logger.error(f"Error processing course record: {str(e)}")
                errors += 1

        return {
            "created": created,
            "updated": updated,
            "errors": errors
        }

    def import_sections_from_csv(self, file_path: str) -> Dict[str, int]:
        """
        Import sections from a CSV file
        Expected CSV format:
        course_code,section_number,instructor,term,year,capacity
        """
        try:
            with open(file_path, 'r') as f:
                reader = csv.DictReader(f)
                return self._process_section_records(reader)
        except Exception as e:
            logger.error(f"Error importing sections from CSV: {str(e)}")
            raise DataImportError(f"Failed to import sections from CSV: {str(e)}")

    def _process_section_records(self, records: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Process section records and insert/update them in the database
        Returns a dictionary with counts of created and updated records
        """
        created = 0
        updated = 0
        errors = 0

        for record in records:
            try:
                # Get the course
                course = course_crud.get_course_by_code(
                    self.db, record["course_code"]
                )
                if not course:
                    logger.warning(f"Course not found: {record['course_code']}")
                    errors += 1
                    continue

                section_data = {
                    "course_id": course.id,
                    "section_number": record["section_number"],
                    "instructor": record["instructor"],
                    "term": record["term"],
                    "year": int(record["year"]),
                    "capacity": int(record.get("capacity", 30))
                }

                # Check if section exists
                existing_section = self.db.query(Section).filter(
                    Section.course_id == course.id,
                    Section.section_number == section_data["section_number"],
                    Section.term == section_data["term"],
                    Section.year == section_data["year"]
                ).first()

                if existing_section:
                    # Update existing section
                    for key, value in section_data.items():
                        setattr(existing_section, key, value)
                    self.db.commit()
                    updated += 1
                else:
                    # Create new section
                    section = Section(**section_data)
                    self.db.add(section)
                    self.db.commit()
                    created += 1

            except Exception as e:
                logger.error(f"Error processing section record: {str(e)}")
                errors += 1

        return {
            "created": created,
            "updated": updated,
            "errors": errors
        } 