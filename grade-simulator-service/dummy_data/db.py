import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from dotenv import load_dotenv
import time

# Load environment variables (but we'll use hardcoded values as fallback)
load_dotenv()

# Path for SQLite database
DB_PATH = os.getenv('DB_PATH', 'simulator_db.sqlite')

print(f"Using SQLite database at: {DB_PATH}")

# Create SQLite database URL
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLAlchemy engine with improved connection pool settings
engine = create_engine(
    DATABASE_URL,
    echo=True,
    # Configure connection pool
    pool_size=20,           # Default is 5, increase pool size
    max_overflow=20,        # Default is 10, increase to handle more connections 
    pool_recycle=1800,      # Recycle connections after 30 minutes
    pool_pre_ping=True,     # Verify connections before using them
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session maker - now using scoped_session for better cleanup
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Create base class for declarative models
Base = declarative_base()

def get_db():
    """
    Get a database session. With automatic closing.
    """
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()
