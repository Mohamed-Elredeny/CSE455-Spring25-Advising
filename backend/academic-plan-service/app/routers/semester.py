from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.semester import Semester, SemesterCreate
from app.crud.semester import create_semester, get_semester, get_all_semesters, delete_semester
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=Semester)
def create_semester_route(semester: SemesterCreate, db: Session = Depends(get_db)):
    return create_semester(db, semester)

@router.get("/{semester_id}", response_model=Semester)
def read_semester(semester_id: int, db: Session = Depends(get_db)):
    db_semester = get_semester(db, semester_id)
    if not db_semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    return db_semester

@router.get("/", response_model=list[Semester])
def read_all_semesters(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_all_semesters(db, skip=skip, limit=limit)

@router.delete("/{semester_id}", response_model=Semester)
def delete_semester_route(semester_id: int, db: Session = Depends(get_db)):
    db_semester = delete_semester(db, semester_id)
    if not db_semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    return db_semester