from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi.responses import JSONResponse
import logging

from app.schemas.schemas import Category, CategoryCreate
from app.crud import category as category_crud
from app.database.database import get_db
from app.utils.error_handling import create_error_response

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={
        404: {"description": "Not found", "model": Dict[str, Any]},
        422: {"description": "Validation error", "model": Dict[str, Any]},
        409: {"description": "Conflict", "model": Dict[str, Any]},
        500: {"description": "Internal server error", "model": Dict[str, Any]}
    },
)

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED,
           responses={
               409: {"description": "Category already exists"},
               422: {"description": "Validation error"}
           })
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new category
    
    - **name**: Category name
    - **description**: Category description
    """
    try:
        # Check if category already exists
        existing_category = category_crud.get_category_by_name(db, name=category.name)
        if existing_category:
            logger.warning(f"Attempted to create duplicate category: {category.name}")
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content=create_error_response(
                    status_code=status.HTTP_409_CONFLICT,
                    message=f"Category with name '{category.name}' already exists",
                    details={"name": category.name}
                )
            )
            
        db_category = category_crud.create_category(db=db, category=category)
        return db_category
    except Exception as e:
        logger.error(f"Error creating category: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to create category",
                details={"error": str(e)}
            )
        )

@router.get("/", response_model=List[Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all categories with pagination
    
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
        categories = category_crud.get_categories(db, skip=skip, limit=limit)
        return categories
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to fetch categories",
                details={"error": str(e)}
            )
        )

@router.get("/{category_id}", response_model=Category,
          responses={
              404: {"description": "Category not found"}
          })
def read_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get a category by ID
    
    - **category_id**: ID of the category to retrieve
    """
    try:
        db_category = category_crud.get_category(db, category_id=category_id)
        if db_category is None:
            logger.warning(f"Category not found: {category_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Category not found",
                    details={"category_id": category_id}
                )
            )
        return db_category
    except Exception as e:
        logger.error(f"Error fetching category {category_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch category {category_id}",
                details={"error": str(e)}
            )
        )

@router.put("/{category_id}", response_model=Category,
          responses={
              404: {"description": "Category not found"},
              422: {"description": "Validation error"}
          })
def update_category(category_id: int, category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Update a category by ID
    
    - **category_id**: ID of the category to update
    - **category**: Updated category data
    """
    try:
        # Check if category exists
        existing_category = category_crud.get_category(db, category_id=category_id)
        if not existing_category:
            logger.warning(f"Attempted to update non-existent category: {category_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Category not found",
                    details={"category_id": category_id}
                )
            )
            
        # Check if the new name conflicts with an existing category
        if category.name != existing_category.name:
            name_conflict = category_crud.get_category_by_name(db, name=category.name)
            if name_conflict:
                logger.warning(f"Name conflict when updating category {category_id}: {category.name}")
                return JSONResponse(
                    status_code=status.HTTP_409_CONFLICT,
                    content=create_error_response(
                        status_code=status.HTTP_409_CONFLICT,
                        message=f"Category with name '{category.name}' already exists",
                        details={"name": category.name}
                    )
                )
        
        db_category = category_crud.update_category(db, category_id=category_id, category_data=category)
        return db_category
    except Exception as e:
        logger.error(f"Error updating category {category_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to update category {category_id}",
                details={"error": str(e)}
            )
        )

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT,
             responses={
                 404: {"description": "Category not found"}
             })
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Delete a category by ID
    
    - **category_id**: ID of the category to delete
    """
    try:
        # Check if category exists
        existing_category = category_crud.get_category(db, category_id=category_id)
        if not existing_category:
            logger.warning(f"Attempted to delete non-existent category: {category_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Category not found",
                    details={"category_id": category_id}
                )
            )
            
        success = category_crud.delete_category(db, category_id=category_id)
        if not success:
            logger.error(f"Failed to delete category: {category_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=f"Failed to delete category {category_id}",
                    details={"category_id": category_id}
                )
            )
            
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content=None
        )
    except Exception as e:
        logger.error(f"Error deleting category {category_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to delete category {category_id}",
                details={"error": str(e)}
            )
        ) 