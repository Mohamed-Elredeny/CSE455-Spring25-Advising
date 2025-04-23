from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import Section
from app.schemas.schemas import SectionCreate

# Create a new section
def create_section(db: Session, section: SectionCreate, course_id: str):
    db_section = Section(
        section_id=section.section_id,
        instructor=section.instructor,
        schedule_day=section.schedule_day,
        schedule_time=section.schedule_time,
        capacity=section.capacity,
        course_id=course_id
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

# Get section by ID
def get_section(db: Session, section_id: str, course_id: str):
    return db.query(Section).filter(
        Section.section_id == section_id,
        Section.course_id == course_id
    ).first()

# Get all sections for a course
def get_sections(db: Session, course_id: str, skip: int = 0, limit: int = 100):
    return db.query(Section).filter(Section.course_id == course_id).offset(skip).limit(limit).all()

# Update a section
def update_section(db: Session, section_id: str, course_id: str, section_data: SectionCreate):
    db_section = db.query(Section).filter(
        Section.section_id == section_id,
        Section.course_id == course_id
    ).first()
    
    if db_section:
        # Update section attributes
        for key, value in section_data.model_dump().items():
            setattr(db_section, key, value)
        
        db.commit()
        db.refresh(db_section)
    
    return db_section

# Delete a section
def delete_section(db: Session, section_id: str, course_id: str):
    db_section = db.query(Section).filter(
        Section.section_id == section_id,
        Section.course_id == course_id
    ).first()
    
    if db_section:
        db.delete(db_section)
        db.commit()
        return True
    
    return False 