from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Requirement(Base):
    __tablename__ = "requirement"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    program = Column(String, nullable=False)  # Program name (e.g., "Computer Science")
    type = Column(String, nullable=False)  # Type of requirement (core, elective, university requirement)
    course_code = Column(String, nullable=False)  # Course code (e.g., "CS101")
    course_id = Column(Integer, ForeignKey("course.id", ondelete="CASCADE"), nullable=False)  # Foreign key to Course table

    # Relationship to Course (optional, for validation purposes)
    course = relationship("Course", backref="requirement", lazy="joined")