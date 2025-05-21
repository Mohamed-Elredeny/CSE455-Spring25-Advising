from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy import Boolean

# Association table for prerequisites
prerequisite_association = Table(
    "prerequisite_association",
    Base.metadata,
    Column("course_id", String, ForeignKey("courses.course_id"), primary_key=True),
    Column("prerequisite_id", String, ForeignKey("courses.course_id"), primary_key=True)
)

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    instructor = Column(String)
    credits = Column(Integer)
    department = Column(String)
    is_core = Column(Boolean, default=False)  
    level = Column(Integer, nullable=True)  

    # Foreign key to Semester
    semester_id = Column(Integer, ForeignKey("semester.id"), nullable=False)

    # Relationship back to Semester
    semester = relationship("Semester", back_populates="courses")

    # Relationship for prerequisites (self-referential)
    prerequisites = relationship(
        "Course", 
        secondary=prerequisite_association,
        primaryjoin=(prerequisite_association.c.course_id == course_id),
        secondaryjoin=(prerequisite_association.c.prerequisite_id == course_id),
        backref="prerequisite_for",
        lazy="joined"  # Ensure prerequisites are eagerly loaded
    )