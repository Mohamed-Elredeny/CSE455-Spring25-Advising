import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.database import Base, get_db
from app.main import app

class TestDatabase:
    """Tests for the database module functions."""
    
    def test_get_db(self):
        """Test the get_db dependency function."""
        # Create a test database
        engine = create_engine(
            "sqlite:///./test_db_func.db",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=engine)
        
        # Create a test SessionLocal
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Patch the SessionLocal in the module with our test version
        from app.database import database
        original_session_local = database.SessionLocal
        database.SessionLocal = TestingSessionLocal
        
        # Test the get_db generator function
        db_generator = get_db()
        db = next(db_generator)
        
        # Verify that we can use the session
        assert db is not None
        
        # This should call db.close() in the finally block
        try:
            next(db_generator)
        except StopIteration:
            pass
        
        # Clean up
        database.SessionLocal = original_session_local
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_db_func.db"):
            os.remove("./test_db_func.db") 