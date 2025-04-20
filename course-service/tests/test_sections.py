import pytest
from fastapi import status

class TestSectionEndpoints:
    """Tests for section endpoints."""
    
    def test_create_section(self, client, create_sample_course, sample_section_data):
        """Test creating a new section for a course."""
        course_id = create_sample_course.course_id
        response = client.post(f"/courses/{course_id}/sections/", json=sample_section_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["section_id"] == sample_section_data["section_id"]
        assert data["instructor"] == sample_section_data["instructor"]
        assert data["course_id"] == course_id
    
    def test_create_section_nonexistent_course(self, client, sample_section_data):
        """Test creating a section for a non-existent course."""
        response = client.post("/courses/nonexistent/sections/", json=sample_section_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_read_sections(self, client, create_sample_course):
        """Test retrieving all sections for a course."""
        course_id = create_sample_course.course_id
        response = client.get(f"/courses/{course_id}/sections/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
    
    def test_read_sections_nonexistent_course(self, client):
        """Test retrieving sections for a non-existent course."""
        response = client.get("/courses/nonexistent/sections/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_read_section(self, client, create_sample_course):
        """Test retrieving a specific section of a course."""
        course_id = create_sample_course.course_id
        section_id = "CS101-A"  # From the fixture
        response = client.get(f"/courses/{course_id}/sections/{section_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["section_id"] == section_id
        assert data["course_id"] == course_id
    
    def test_read_nonexistent_section(self, client, create_sample_course):
        """Test retrieving a non-existent section."""
        course_id = create_sample_course.course_id
        response = client.get(f"/courses/{course_id}/sections/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_section(self, client, create_sample_course, sample_section_data):
        """Test updating a section."""
        course_id = create_sample_course.course_id
        section_id = "CS101-A"  # From the fixture
        
        # Create new data with updated fields
        updated_data = sample_section_data.copy()
        updated_data["section_id"] = section_id  # Ensure we're updating the correct section
        updated_data["instructor"] = "Updated Instructor"
        updated_data["capacity"] = 40
        
        response = client.put(f"/courses/{course_id}/sections/{section_id}", json=updated_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["instructor"] == "Updated Instructor"
        assert data["capacity"] == 40
    
    def test_update_nonexistent_section(self, client, create_sample_course, sample_section_data):
        """Test updating a non-existent section."""
        course_id = create_sample_course.course_id
        response = client.put(f"/courses/{course_id}/sections/nonexistent", json=sample_section_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_section(self, client, create_sample_course):
        """Test deleting a section."""
        course_id = create_sample_course.course_id
        section_id = "CS101-A"  # From the fixture
        
        response = client.delete(f"/courses/{course_id}/sections/{section_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        response = client.get(f"/courses/{course_id}/sections/{section_id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_nonexistent_section(self, client, create_sample_course):
        """Test deleting a non-existent section."""
        course_id = create_sample_course.course_id
        response = client.delete(f"/courses/{course_id}/sections/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_validation_errors(self, client, create_sample_course):
        """Test validation errors for section creation."""
        course_id = create_sample_course.course_id
        
        # Missing required fields
        incomplete_section = {
            "instructor": "Test Instructor",
            "capacity": 30
        }
        
        response = client.post(f"/courses/{course_id}/sections/", json=incomplete_section)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 