from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from app.database.database import Base

# Many-to-many relationship for prerequisites
prerequisite_association = Table(
    "prerequisite_association",
    Base.metadata,
    Column("course_id", String, ForeignKey("courses.course_id")),
    Column("prerequisite_id", String, ForeignKey("courses.course_id"))
)

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    instructor = Column(String)
    credits = Column(Integer)
    department = Column(String)
    
    # Relationship for prerequisites (self-referential)
    prerequisites = relationship(
        "Course", 
        secondary=prerequisite_association,
        primaryjoin=(prerequisite_association.c.course_id == course_id),
        secondaryjoin=(prerequisite_association.c.prerequisite_id == course_id),
        backref="prerequisite_for",
        lazy="joined"  # Ensure prerequisites are eagerly loaded
    )
    
    # Relationship with sections
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan")

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(String, index=True)
    instructor = Column(String)
    schedule_day = Column(String)
    schedule_time = Column(String)
    capacity = Column(Integer)
    course_id = Column(String, ForeignKey("courses.course_id"))
    
    # Relationship with course
    course = relationship("Course", back_populates="sections") 