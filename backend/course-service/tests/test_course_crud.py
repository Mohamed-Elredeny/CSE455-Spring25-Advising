import pytest
from sqlalchemy.orm import Session
from fastapi import status
from sqlalchemy import text

from app.crud import course as course_crud
from app.schemas.schemas import CourseCreate, SectionCreate, CategoryCreate
from app.models.models import Course, Section, Category

class TestCourseCrud:
    """Tests for the course CRUD operations that need additional coverage."""
    
    def test_resolve_dependencies_edge_cases(self, db_session):
        """Test resolve_dependencies function for edge cases including circular dependencies."""
        # Create test courses
        courses = [
            Course(course_id="A101", title="Course A", description="Test A", instructor="Instructor A", 
                   credits=3, department="CS", is_core=True, level=100),
            Course(course_id="B101", title="Course B", description="Test B", instructor="Instructor B", 
                   credits=3, department="CS", is_core=True, level=100),
            Course(course_id="C101", title="Course C", description="Test C", instructor="Instructor C", 
                   credits=3, department="CS", is_core=True, level=100)
        ]
        
        for course in courses:
            db_session.add(course)
        
        db_session.commit()
        
        # Add prerequisites (A -> B -> C -> A) creating a circular dependency
        db_session.execute(
            text("INSERT INTO prerequisite_association (course_id, prerequisite_id) VALUES ('B101', 'A101')")
        )
        db_session.execute(
            text("INSERT INTO prerequisite_association (course_id, prerequisite_id) VALUES ('C101', 'B101')")
        )
        db_session.execute(
            text("INSERT INTO prerequisite_association (course_id, prerequisite_id) VALUES ('A101', 'C101')")
        )
        
        db_session.commit()
        
        # Test with circular dependencies
        result = course_crud.resolve_dependencies(db_session, "A101")
        assert result is not None
        
        # Test with non-existent course
        result = course_crud.resolve_dependencies(db_session, "NONEXIST")
        assert result is None

    def test_search_courses_all_methods(self, db_session, create_multiple_courses):
        """Test all search_by methods in search_courses function."""
        # First, ensure we have a category named "Core" for testing
        core_category = Category(name="Core", description="Core courses for testing")
        db_session.add(core_category)
        db_session.commit()
        
        # Link a course to this category
        db_session.execute(
            text("INSERT INTO program_category (course_id, category_id) VALUES ('CS101', :category_id)").bindparams(category_id=core_category.id)
        )
        db_session.commit()
        
        # Test search by category
        result = course_crud.search_courses(db_session, "Core", search_by="category")
        assert len(result) > 0
        
        # Test search with default search_by (when invalid search_by is provided)
        result = course_crud.search_courses(db_session, "Computer", search_by="invalid_option")
        assert len(result) > 0
        
        # Test search by description
        result = course_crud.search_courses(db_session, "calculus", search_by="description")
        assert len(result) > 0
        assert "MATH101" in [course.course_id for course in result]
        
        # Test search by course_id
        result = course_crud.search_courses(db_session, "MATH", search_by="course_id")
        assert len(result) > 0
        assert "MATH101" in [course.course_id for course in result]
        
        # Test search by department
        result = course_crud.search_courses(db_session, "Mathematics", search_by="department")
        assert len(result) > 0
        assert "MATH101" in [course.course_id for course in result]
        
        # Create a different category for additional testing
        category = Category(name="TestCategory", description="Test Category")
        db_session.add(category)
        db_session.commit()
        
        # Add a course to this category
        db_session.execute(
            text("INSERT INTO program_category (course_id, category_id) VALUES ('CS101', :category_id)").bindparams(category_id=category.id)
        )
        db_session.commit()
        
        # Test search by category name
        result = course_crud.search_courses(db_session, "TestCategory", search_by="category")
        assert len(result) > 0
        assert "CS101" in [course.course_id for course in result]
    
    def test_check_prerequisites_met(self, db_session, create_multiple_courses):
        """Test check_prerequisites_met function."""
        # CS201 has CS101 as prerequisite (set up in the create_multiple_courses fixture)
        
        # Test when prerequisites are met
        result = course_crud.check_prerequisites_met(db_session, "CS201", ["CS101"])
        assert result["met"] is True
        assert len(result["missing"]) == 0
        
        # Test when prerequisites are not met
        result = course_crud.check_prerequisites_met(db_session, "CS201", [])
        assert result["met"] is False
        assert len(result["missing"]) == 1
        assert result["missing"][0]["course_id"] == "CS101"
        
        # Test with non-existent course
        result = course_crud.check_prerequisites_met(db_session, "NONEXIST", [])
        assert result["met"] is False
        assert "error" in result
        
        # Test course with no prerequisites
        result = course_crud.check_prerequisites_met(db_session, "CS101", [])
        assert result["met"] is True
        assert len(result["missing"]) == 0
        
    def test_update_course_with_categories(self, db_session):
        """Test updating a course with categories."""
        # Create initial course
        course = Course(
            course_id="UPDATE101",
            title="Update Test",
            description="Testing updates",
            instructor="Update Instructor",
            credits=3,
            department="Test",
            is_core=False,
            level=100
        )
        db_session.add(course)
        db_session.commit()
        
        # Create category
        category = Category(name="UpdateCategory", description="For testing updates")
        db_session.add(category)
        db_session.commit()
        
        # Update course with category
        updated_data = CourseCreate(
            course_id="UPDATE101",
            title="Updated Title",
            description="Updated description",
            instructor="Updated Instructor",
            credits=4,
            department="Updated Dept",
            is_core=True,
            level=200,
            prerequisites=[],
            categories=["UpdateCategory"],
            sections=[]
        )
        
        # Update the course
        result = course_crud.update_course(db_session, "UPDATE101", updated_data)
        
        # Verify update worked
        assert result.title == "Updated Title"
        assert result.credits == 4
        
        # Verify category was added
        db_category = db_session.query(Category).filter(Category.name == "UpdateCategory").first()
        assert db_category is not None
        
        # Verify course has the category
        course = course_crud.get_course(db_session, "UPDATE101")
        assert len(course.categories) == 1
        assert course.categories[0].name == "UpdateCategory" 