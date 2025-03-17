from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.schemas import Section, SectionCreate
from app.crud import section as section_crud
from app.crud import course as course_crud
from app.database.database import get_db

router = APIRouter(
    prefix="/courses/{course_id}/sections",
    tags=["sections"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Section, status_code=status.HTTP_201_CREATED)
def create_section(
    course_id: str, 
    section: SectionCreate, 
    db: Session = Depends(get_db)
):
    # Verify course exists
    db_course = course_crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return section_crud.create_section(db=db, section=section, course_id=course_id)

@router.get("/", response_model=List[Section])
def read_sections(
    course_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Verify course exists
    db_course = course_crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    sections = section_crud.get_sections(db, course_id=course_id, skip=skip, limit=limit)
    return sections

@router.get("/{section_id}", response_model=Section)
def read_section(
    course_id: str, 
    section_id: str, 
    db: Session = Depends(get_db)
):
    db_section = section_crud.get_section(db, section_id=section_id, course_id=course_id)
    if db_section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section

@router.put("/{section_id}", response_model=Section)
def update_section(
    course_id: str, 
    section_id: str, 
    section: SectionCreate, 
    db: Session = Depends(get_db)
):
    db_section = section_crud.update_section(
        db, 
        section_id=section_id, 
        course_id=course_id, 
        section_data=section
    )
    if db_section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    course_id: str, 
    section_id: str, 
    db: Session = Depends(get_db)
):
    success = section_crud.delete_section(db, section_id=section_id, course_id=course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"detail": "Section deleted successfully"} 