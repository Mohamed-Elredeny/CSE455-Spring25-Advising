from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from app.models.plan_sharing import PlanSharing
from sqlalchemy import DateTime
from sqlalchemy.sql import func


class PlanStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AcademicPlan(Base):
    __tablename__ = "academic_plan"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    university = Column(String, nullable=False)  # University name (e.g., "University of XYZ")
    department = Column(String, nullable=False)  # Department name (e.g., "Computer Science")
    program = Column(String, nullable=False)  # Program name (e.g., "Computer Science" or "Business")
    version = Column(Integer, nullable=False, default=1)  # Version number for the plan
    status = Column(Enum(PlanStatus), nullable=False, default=PlanStatus.PENDING)  # Status of the plan
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    semesters = relationship("Semester", back_populates="academic_plan", cascade="all, delete-orphan")
    shared_links = relationship("PlanSharing", back_populates="academic_plan", cascade="all, delete-orphan")