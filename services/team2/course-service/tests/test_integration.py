import pytest
from fastapi import status

class TestIntegration:
    """Integration tests for the API."""
    
    def test_course_crud_flow(self, client):
        """Test the complete CRUD flow for courses."""
        # 1. Create a course
        course_data = {
            "course_id": "INT101",
            "title": "Integration Testing",
            "description": "Learning how to test APIs",
            "instructor": "Test Instructor",
            "credits": 3,
            "department": "Computer Science",
            "prerequisites": [],
            "sections": [
                {
                    "section_id": "INT101-A",
                    "instructor": "Test Instructor",
                    "schedule_day": "Monday",
                    "schedule_time": "9:00 AM",
                    "capacity": 30
                }
            ]
        }
        
        response = client.post("/courses/", json=course_data)
        assert response.status_code == status.HTTP_201_CREATED
        created_course = response.json()
        assert created_course["course_id"] == "INT101"
        
        # 2. Read the course
        response = client.get("/courses/INT101")
        assert response.status_code == status.HTTP_200_OK
        course = response.json()
        assert course["title"] == "Integration Testing"
        assert len(course["sections"]) == 1
        
        # 3. Update the course
        updated_data = course_data.copy()
        updated_data["title"] = "Updated Integration Testing"
        updated_data["credits"] = 4
        
        response = client.put("/courses/INT101", json=updated_data)
        assert response.status_code == status.HTTP_200_OK
        updated_course = response.json()
        assert updated_course["title"] == "Updated Integration Testing"
        assert updated_course["credits"] == 4
        
        # 4. Delete the course
        response = client.delete("/courses/INT101")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # 5. Verify deletion
        response = client.get("/courses/INT101")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_prerequisites_flow(self, client):
        """Test the flow for working with prerequisites."""
        # 1. Create two initial courses
        course1 = {
            "course_id": "PRE101",
            "title": "Prerequisite Course 1",
            "description": "First prerequisite course",
            "instructor": "Dr. First",
            "credits": 3,
            "department": "Computer Science",
            "prerequisites": [],
            "sections": []
        }
        
        course2 = {
            "course_id": "PRE102",
            "title": "Prerequisite Course 2",
            "description": "Second prerequisite course",
            "instructor": "Dr. Second",
            "credits": 3,
            "department": "Computer Science",
            "prerequisites": [],
            "sections": []
        }
        
        # Create the courses
        client.post("/courses/", json=course1)
        client.post("/courses/", json=course2)
        
        # 2. Create a course that depends on the first two
        advanced_course = {
            "course_id": "ADV201",
            "title": "Advanced Course",
            "description": "Requires prerequisites",
            "instructor": "Dr. Advanced",
            "credits": 4,
            "department": "Computer Science",
            "prerequisites": ["PRE101", "PRE102"],
            "sections": [
                {
                    "section_id": "ADV201-A",
                    "instructor": "Dr. Advanced",
                    "schedule_day": "Friday",
                    "schedule_time": "1:00 PM",
                    "capacity": 20
                }
            ]
        }
        
        response = client.post("/courses/", json=advanced_course)
        assert response.status_code == status.HTTP_201_CREATED
        
        # 3. Verify the prerequisites
        response = client.get("/courses/ADV201")
        assert response.status_code == status.HTTP_200_OK
        course = response.json()
        assert len(course["prerequisites"]) == 2
        assert "PRE101" in course["prerequisites"]
        assert "PRE102" in course["prerequisites"]
        
        # 4. Update prerequisites
        updated_course = advanced_course.copy()
        updated_course["prerequisites"] = ["PRE101"]  # Remove PRE102
        
        response = client.put("/courses/ADV201", json=updated_course)
        assert response.status_code == status.HTTP_200_OK
        
        # 5. Verify updated prerequisites
        response = client.get("/courses/ADV201")
        assert response.status_code == status.HTTP_200_OK
        course = response.json()
        assert len(course["prerequisites"]) == 1
        assert "PRE101" in course["prerequisites"]
        assert "PRE102" not in course["prerequisites"]
    
    def test_section_management_flow(self, client):
        """Test the flow for managing sections."""
        # 1. Create a course with one section
        course_data = {
            "course_id": "SEC101",
            "title": "Section Management",
            "description": "Testing section management",
            "instructor": "Dr. Section",
            "credits": 3,
            "department": "Computer Science",
            "prerequisites": [],
            "sections": [
                {
                    "section_id": "SEC101-A",
                    "instructor": "Dr. Section",
                    "schedule_day": "Monday",
                    "schedule_time": "10:00 AM",
                    "capacity": 30
                }
            ]
        }
        
        response = client.post("/courses/", json=course_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # 2. Add a new section
        new_section = {
            "section_id": "SEC101-B",
            "instructor": "Dr. Other",
            "schedule_day": "Wednesday",
            "schedule_time": "2:00 PM",
            "capacity": 25
        }
        
        response = client.post("/courses/SEC101/sections/", json=new_section)
        assert response.status_code == status.HTTP_201_CREATED
        
        # 3. Verify both sections exist
        response = client.get("/courses/SEC101/sections/")
        assert response.status_code == status.HTTP_200_OK
        sections = response.json()
        assert len(sections) == 2
        
        # 4. Update a section
        updated_section = new_section.copy()
        updated_section["capacity"] = 35
        
        response = client.put("/courses/SEC101/sections/SEC101-B", json=updated_section)
        assert response.status_code == status.HTTP_200_OK
        section = response.json()
        assert section["capacity"] == 35
        
        # 5. Delete a section
        response = client.delete("/courses/SEC101/sections/SEC101-A")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # 6. Verify only one section remains
        response = client.get("/courses/SEC101/sections/")
        assert response.status_code == status.HTTP_200_OK
        sections = response.json()
        assert len(sections) == 1
        assert sections[0]["section_id"] == "SEC101-B" 