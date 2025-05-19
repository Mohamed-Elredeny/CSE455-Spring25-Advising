from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.requirement import Requirement, RequirementCreate
from app.crud.requirement import create_requirements, get_all_requirements

router = APIRouter()

@router.post("/", response_model=list[Requirement])
def create_requirements_route(requirement: RequirementCreate, db: Session = Depends(get_db)):
    return create_requirements(db, requirement)

@router.get("/", response_model=list[Requirement])
def get_requirements_route(program_id: int , db: Session = Depends(get_db)):
    return get_all_requirements(db, program_id)

