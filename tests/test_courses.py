import pytest
from fastapi import status

class TestCourseEndpoints:
    """Tests for course endpoints."""
    
    def test_create_course(self, client, sample_course_data):
        """Test creating a new course."""
        response = client.post("/courses/", json=sample_course_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["course_id"] == sample_course_data["course_id"]
        assert data["title"] == sample_course_data["title"]
        assert len(data["sections"]) == 1
    
    def test_read_course(self, client, create_sample_course):
        """Test retrieving a single course."""
        course_id = create_sample_course.course_id
        response = client.get(f"/courses/{course_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["course_id"] == course_id
        assert len(data["sections"]) == 1
    
    def test_read_nonexistent_course(self, client):
        """Test retrieving a non-existent course."""
        response = client.get("/courses/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_read_all_courses(self, client, create_multiple_courses):
        """Test retrieving all courses."""
        response = client.get("/courses/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3
    
    def test_update_course(self, client, create_sample_course, sample_course_data):
        """Test updating a course."""
        course_id = create_sample_course.course_id
        updated_data = sample_course_data.copy()
        updated_data["title"] = "Updated Course Title"
        updated_data["credits"] = 4
        
        response = client.put(f"/courses/{course_id}", json=updated_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["title"] == "Updated Course Title"
        assert data["credits"] == 4
    
    def test_update_nonexistent_course(self, client, sample_course_data):
        """Test updating a non-existent course."""
        response = client.put("/courses/nonexistent", json=sample_course_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_course(self, client, create_sample_course):
        """Test deleting a course."""
        course_id = create_sample_course.course_id
        response = client.delete(f"/courses/{course_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        response = client.get(f"/courses/{course_id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_nonexistent_course(self, client):
        """Test deleting a non-existent course."""
        response = client.delete("/courses/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_create_course_with_prerequisites(self, client, create_multiple_courses):
        """Test creating a course with prerequisites."""
        # New course that requires CS101 and CS201
        new_course = {
            "course_id": "CS301",
            "title": "Algorithm Design",
            "description": "Advanced algorithms course",
            "instructor": "Alice Johnson",
            "credits": 4,
            "department": "Computer Science",
            "prerequisites": ["CS101", "CS201"],
            "sections": [
                {
                    "section_id": "CS301-A",
                    "instructor": "Alice Johnson",
                    "schedule_day": "Tuesday",
                    "schedule_time": "10:00 AM",
                    "capacity": 25
                }
            ]
        }
        
        response = client.post("/courses/", json=new_course)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify prerequisites were added
        response = client.get("/courses/CS301")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["prerequisites"]) == 2
        assert "CS101" in data["prerequisites"]
        assert "CS201" in data["prerequisites"]
    
    def test_validation_errors(self, client):
        """Test validation errors for course creation."""
        # Missing required fields
        incomplete_course = {
            "title": "Incomplete Course",
            "description": "Missing required fields"
        }
        
        response = client.post("/courses/", json=incomplete_course)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 