from fastapi import HTTPException, status
from typing import Optional, Dict, Any, Type
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import ValidationError
import logging

# Set up logging
logger = logging.getLogger(__name__)

class DatabaseOperationError(Exception):
    """Exception raised for database operation errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ResourceNotFoundError(Exception):
    """Exception raised when a resource is not found."""
    def __init__(self, resource_type: str, resource_id: Any):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.message = f"{resource_type} with id {resource_id} not found"
        self.status_code = status.HTTP_404_NOT_FOUND
        super().__init__(self.message)

class ValidationFailedError(Exception):
    """Exception raised when validation fails."""
    def __init__(self, message: str):
        self.message = message
        self.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        super().__init__(self.message)

class DuplicateResourceError(Exception):
    """Exception raised when trying to create a duplicate resource."""
    def __init__(self, resource_type: str, identifier: str):
        self.resource_type = resource_type
        self.identifier = identifier
        self.message = f"{resource_type} with identifier {identifier} already exists"
        self.status_code = status.HTTP_409_CONFLICT
        super().__init__(self.message)

def handle_db_operation(func):
    """Decorator to handle database operations and exception handling."""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ResourceNotFoundError as e:
            logger.warning(f"Resource not found: {e.message}")
            raise HTTPException(status_code=e.status_code, detail=e.message)
        except ValidationFailedError as e:
            logger.warning(f"Validation failed: {e.message}")
            raise HTTPException(status_code=e.status_code, detail=e.message)
        except DuplicateResourceError as e:
            logger.warning(f"Duplicate resource: {e.message}")
            raise HTTPException(status_code=e.status_code, detail=e.message)
        except IntegrityError as e:
            logger.error(f"Database integrity error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Database integrity error: This operation would violate database constraints"
            )
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error occurred: {str(e)}"
            )
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Validation error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected error occurred: {str(e)}"
            )
    return wrapper

def create_error_response(status_code: int, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Create a standardized error response"""
    response = {
        "status": "error",
        "code": status_code,
        "message": message
    }
    
    if details:
        response["details"] = details
        
    return response 