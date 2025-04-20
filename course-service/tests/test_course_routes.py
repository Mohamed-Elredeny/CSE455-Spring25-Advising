import pytest
from fastapi import status
from fastapi.testclient import TestClient

class TestCourseRoutes:
    """Tests for the routes in courses.py that need additional coverage."""
    
    def test_get_course_dependencies(self, client, create_multiple_courses):
        """Test the get_course_dependencies endpoint."""
        # Test with a valid course that has prerequisites
        response = client.get("/courses/CS201/dependencies")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["course_id"] == "CS201"
        assert "prerequisites" in response.json()
        
        # Test with a course that doesn't exist
        response = client.get("/courses/NONEXIST/dependencies")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_check_prerequisites(self, client, create_multiple_courses):
        """Test the check_prerequisites endpoint."""
        # Test with prerequisites met
        response = client.post(
            "/courses/CS201/check-prerequisites",
            json=["CS101"]
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["met"] is True
        assert len(response.json()["missing"]) == 0
        
        # Test with prerequisites not met
        response = client.post(
            "/courses/CS201/check-prerequisites",
            json=[]
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["met"] is False
        assert len(response.json()["missing"]) == 1
        
        # Test with a course that doesn't exist
        response = client.post(
            "/courses/NONEXIST/check-prerequisites",
            json=[]
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND 