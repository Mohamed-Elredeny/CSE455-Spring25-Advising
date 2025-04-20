import pytest
from fastapi import status

class TestCategoryEndpoints:
    """Tests for category endpoints."""
    
    def test_create_category(self, client):
        """Test creating a new category."""
        category_data = {
            "name": "Core Courses",
            "description": "Fundamental courses required for all students"
        }
        response = client.post("/categories/", json=category_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == category_data["name"]
        assert data["description"] == category_data["description"]
    
    def test_read_categories(self, client):
        """Test retrieving all categories."""
        # First create some categories
        categories = [
            {"name": "Core Courses", "description": "Required courses"},
            {"name": "Electives", "description": "Optional courses"},
            {"name": "Capstone", "description": "Final project courses"}
        ]
        
        for category in categories:
            client.post("/categories/", json=category)
        
        response = client.get("/categories/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 3
        
        category_names = [category["name"] for category in data]
        for expected_category in categories:
            assert expected_category["name"] in category_names
    
    def test_read_category(self, client):
        """Test retrieving a specific category."""
        # Create a category
        category_data = {
            "name": "Advanced Courses",
            "description": "Upper-level specialized courses"
        }
        create_response = client.post("/categories/", json=category_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        created_category = create_response.json()
        
        # Get the category by ID
        category_id = created_category["id"]
        response = client.get(f"/categories/{category_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == category_data["name"]
        assert data["description"] == category_data["description"]
    
    def test_read_nonexistent_category(self, client):
        """Test retrieving a non-existent category."""
        # Assume 9999 is an ID that doesn't exist
        response = client.get("/categories/9999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_category(self, client):
        """Test updating a category."""
        # Create a category
        category_data = {
            "name": "Labs",
            "description": "Laboratory courses"
        }
        create_response = client.post("/categories/", json=category_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        created_category = create_response.json()
        
        # Update the category
        update_data = {
            "name": "Laboratory Courses",
            "description": "Hands-on laboratory experience courses"
        }
        category_id = created_category["id"]
        response = client.put(f"/categories/{category_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        updated_category = response.json()
        assert updated_category["name"] == update_data["name"]
        assert updated_category["description"] == update_data["description"]
    
    def test_update_nonexistent_category(self, client):
        """Test updating a non-existent category."""
        update_data = {
            "name": "Non-existent Category",
            "description": "This category doesn't exist"
        }
        # Assume 9999 is an ID that doesn't exist
        response = client.put("/categories/9999", json=update_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_category(self, client):
        """Test deleting a category."""
        # Create a category
        category_data = {
            "name": "Temporary Category",
            "description": "This category will be deleted"
        }
        create_response = client.post("/categories/", json=category_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        created_category = create_response.json()
        
        # Delete the category
        category_id = created_category["id"]
        response = client.delete(f"/categories/{category_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        verify_response = client.get(f"/categories/{category_id}")
        assert verify_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_nonexistent_category(self, client):
        """Test deleting a non-existent category."""
        # Assume 9999 is an ID that doesn't exist
        response = client.delete("/categories/9999")
        assert response.status_code == status.HTTP_404_NOT_FOUND 