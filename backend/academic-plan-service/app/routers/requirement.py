from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.requirement import Requirement, RequirementCreate, RequirementUpdate
from app.crud.requirement import create_requirements, get_all_requirements, update_requirement, delete_requirement

router = APIRouter()

@router.post("/", response_model=Requirement)
def create_requirements_route(requirement: RequirementCreate, db: Session = Depends(get_db)):
    return create_requirements(db, requirement)

@router.get("/", response_model=list[Requirement])
def get_requirements_route(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_all_requirements(db, skip=skip, limit=limit)

@router.put("/{requirement_id}", response_model=Requirement)
def update_requirement_route(requirement_id: int, req_update: RequirementUpdate, db: Session = Depends(get_db)):
    req = update_requirement(db, requirement_id, req_update)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return req

@router.delete("/{requirement_id}", response_model=Requirement)
def delete_requirement_route(requirement_id: int, db: Session = Depends(get_db)):
    req = delete_requirement(db, requirement_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return req