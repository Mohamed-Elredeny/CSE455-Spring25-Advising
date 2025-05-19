from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class AccessLevel(enum.Enum):
    VIEW = "VIEW"
    EDIT = "EDIT"

class PlanSharing(Base):
    __tablename__ = "plan_sharing"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    academic_plan_id = Column(Integer, ForeignKey("academic_plan.id"), nullable=False)
    shareable_link = Column(String, unique=True, nullable=False)
    access_level = Column(Enum(AccessLevel), nullable=False, default=AccessLevel.VIEW)
    expiration_date = Column(DateTime, nullable=True)

    academic_plan = relationship("AcademicPlan", back_populates="shared_links")