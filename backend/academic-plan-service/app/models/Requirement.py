from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class Requirement(Base):
    __tablename__ = "requirement"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    program = Column(String, nullable=False, unique=True)
    total_hours = Column(Integer, nullable=False)
    num_core_courses = Column(Integer, nullable=False)
    num_elective_courses = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)