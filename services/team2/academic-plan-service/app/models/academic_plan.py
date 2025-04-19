from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from app.models.plan_sharing import PlanSharing


class PlanStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AcademicPlan(Base):
    __tablename__ = "academic_plan"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, nullable=False)
    program = Column(String, nullable=False)  # Program name (e.g., "Computer Science")
    version = Column(Integer, nullable=False, default=1)  # Version number for the plan
    status = Column(Enum(PlanStatus), nullable=False, default=PlanStatus.PENDING)  # Status of the plan

    semesters = relationship("Semester", back_populates="academic_plan", cascade="all, delete-orphan")
    shared_links = relationship("PlanSharing", back_populates="academic_plan", cascade="all, delete-orphan")