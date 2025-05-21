from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Semester(Base):
    __tablename__ = "semester"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    academic_plan_id = Column(Integer, ForeignKey("academic_plan.id", ondelete="CASCADE"), nullable=False)

    
    courses = relationship("Course", back_populates="semester", cascade="all, delete-orphan", lazy="joined")
    academic_plan = relationship("AcademicPlan", back_populates="semesters")