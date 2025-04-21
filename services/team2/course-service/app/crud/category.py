from sqlalchemy.orm import Session
from typing import List

from app.models.models import Category
from app.schemas.schemas import CategoryCreate

def create_category(db: Session, category: CategoryCreate):
    """Create a new category"""
    db_category = Category(
        name=category.name,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_category(db: Session, category_id: int):
    """Get a single category by ID"""
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    """Get a single category by name"""
    return db.query(Category).filter(Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """Get all categories with pagination"""
    return db.query(Category).offset(skip).limit(limit).all()

def update_category(db: Session, category_id: int, category_data: CategoryCreate):
    """Update a category by ID"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        update_data = category_data.model_dump()
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    """Delete a category by ID"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False 