import pytest
from app.schemas.schemas import Course, CourseCreate
from app.models.models import Course as CourseModel, Category as CategoryModel

class TestSchemaValidators:
    """Tests for schema validators."""
    
    def test_course_schema_process_prerequisites_non_dict(self):
        """Test the process_prerequisites validator with non-dict input."""
        # Test with non-dict input
        non_dict_input = ["not", "a", "dict"]
        result = Course.process_prerequisites(non_dict_input)
        assert result == non_dict_input
    
    def test_course_schema_process_prerequisites_with_objects(self):
        """Test the process_prerequisites validator with course objects."""
        # Create mock course objects
        class MockCourse:
            def __init__(self, course_id):
                self.course_id = course_id
        
        # Create input with course objects
        data = {
            'course_id': 'TEST101',
            'title': 'Test Course',
            'description': 'Test Description',
            'instructor': 'Test Instructor',
            'credits': 3,
            'department': 'TEST',
            'prerequisites': [MockCourse('PREREQ101'), MockCourse('PREREQ102')],
            'categories': []
        }
        
        result = Course.process_prerequisites(data)
        assert result['prerequisites'] == ['PREREQ101', 'PREREQ102']
    
    def test_course_schema_process_categories_with_objects(self):
        """Test the process_prerequisites validator with category objects."""
        # Create mock category objects
        class MockCategory:
            def __init__(self, name):
                self.name = name
        
        # Create input with category objects
        data = {
            'course_id': 'TEST101',
            'title': 'Test Course',
            'description': 'Test Description',
            'instructor': 'Test Instructor',
            'credits': 3,
            'department': 'TEST',
            'prerequisites': [],
            'categories': [MockCategory('Category1'), MockCategory('Category2')]
        }
        
        result = Course.process_prerequisites(data)
        assert result['categories'] == ['Category1', 'Category2'] 