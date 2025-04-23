import pytest
from fastapi import status

@pytest.fixture
def create_categories(client):
    """Create sample categories for testing."""
    categories = [
        {"name": "Core", "description": "Core curriculum courses"},
        {"name": "Elective", "description": "Elective courses"},
        {"name": "Programming", "description": "Programming-focused courses"},
        {"name": "Theory", "description": "Theoretical computer science courses"}
    ]
    
    for category in categories:
        client.post("/categories/", json=category)
    
    return categories

@pytest.fixture
def create_prerequisite_chain(client):
    """Create a chain of courses with prerequisites for testing."""
    # Create courses in order of dependency
    courses = [
        {
            "course_id": "MATH101",
            "title": "Calculus I",
            "description": "Introduction to calculus",
            "instructor": "David Miller",
            "credits": 4,
            "department": "Mathematics",
            "is_core": True,
            "level": 100,
            "prerequisites": [],
            "categories": ["Core"],
            "sections": [{
                "section_id": "MATH101-A",
                "instructor": "David Miller",
                "schedule_day": "Monday",
                "schedule_time": "9:00 AM",
                "capacity": 40
            }]
        },
        {
            "course_id": "MATH201",
            "title": "Calculus II",
            "description": "Continuation of calculus",
            "instructor": "Sarah Johnson",
            "credits": 4,
            "department": "Mathematics",
            "is_core": True,
            "level": 200,
            "prerequisites": ["MATH101"],
            "categories": ["Core"],
            "sections": [{
                "section_id": "MATH201-A",
                "instructor": "Sarah Johnson",
                "schedule_day": "Tuesday",
                "schedule_time": "9:00 AM",
                "capacity": 35
            }]
        },
        {
            "course_id": "CS101",
            "title": "Introduction to Programming",
            "description": "Basic programming concepts",
            "instructor": "John Smith",
            "credits": 3,
            "department": "Computer Science",
            "is_core": True,
            "level": 100,
            "prerequisites": [],
            "categories": ["Core", "Programming"],
            "sections": [{
                "section_id": "CS101-A",
                "instructor": "John Smith",
                "schedule_day": "Monday",
                "schedule_time": "1:00 PM",
                "capacity": 50
            }]
        },
        {
            "course_id": "CS201",
            "title": "Data Structures",
            "description": "Fundamental data structures",
            "instructor": "Emily Chen",
            "credits": 4,
            "department": "Computer Science",
            "is_core": True,
            "level": 200,
            "prerequisites": ["CS101", "MATH101"],
            "categories": ["Core", "Programming"],
            "sections": [{
                "section_id": "CS201-A",
                "instructor": "Emily Chen",
                "schedule_day": "Wednesday",
                "schedule_time": "1:00 PM",
                "capacity": 45
            }]
        },
        {
            "course_id": "CS301",
            "title": "Algorithms",
            "description": "Algorithm design and analysis",
            "instructor": "Michael Brown",
            "credits": 4,
            "department": "Computer Science",
            "is_core": True,
            "level": 300,
            "prerequisites": ["CS201", "MATH201"],
            "categories": ["Core", "Theory"],
            "sections": [{
                "section_id": "CS301-A",
                "instructor": "Michael Brown",
                "schedule_day": "Thursday",
                "schedule_time": "10:00 AM",
                "capacity": 40
            }]
        },
        {
            "course_id": "CS450",
            "title": "Machine Learning",
            "description": "Introduction to machine learning",
            "instructor": "Lisa Wang",
            "credits": 4,
            "department": "Computer Science",
            "is_core": False,
            "level": 400,
            "prerequisites": ["CS301"],
            "categories": ["Elective", "Theory"],
            "sections": [{
                "section_id": "CS450-A",
                "instructor": "Lisa Wang",
                "schedule_day": "Friday",
                "schedule_time": "2:00 PM",
                "capacity": 30
            }]
        }
    ]
    
    for course in courses:
        response = client.post("/courses/", json=course)
        assert response.status_code == status.HTTP_201_CREATED
    
    return courses

class TestCategorization:
    """Tests for course categorization features."""
    
    def test_course_categories(self, client, create_categories, create_prerequisite_chain):
        """Test that courses can be assigned to categories."""
        # Verify CS101 has correct categories
        response = client.get("/courses/CS101")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "Core" in data["categories"]
        assert "Programming" in data["categories"]
    
    def test_get_courses_by_category(self, client, create_categories, create_prerequisite_chain):
        """Test filtering courses by category."""
        # Get all programming courses
        response = client.get("/courses/by-category/Programming")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 2  # At least CS101 and CS201
        
        course_ids = [course["course_id"] for course in data]
        assert "CS101" in course_ids
        assert "CS201" in course_ids
    
    def test_search_by_category(self, client, create_categories, create_prerequisite_chain):
        """Test searching courses by category."""
        response = client.get("/courses/search/?query=Theory&search_by=category")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 2  # At least CS301 and CS450
        
        course_ids = [course["course_id"] for course in data]
        assert "CS301" in course_ids
        assert "CS450" in course_ids

class TestCoreAndLevelFiltering:
    """Tests for core course and level filtering features."""
    
    def test_get_core_courses(self, client, create_prerequisite_chain):
        """Test filtering core courses."""
        response = client.get("/courses/core/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 5  # MATH101, MATH201, CS101, CS201, CS301
        
        # All returned courses should be core courses
        for course in data:
            assert course["is_core"] == True
        
        # CS450 should not be in the results (it's not a core course)
        course_ids = [course["course_id"] for course in data]
        assert "CS450" not in course_ids
    
    def test_get_courses_by_level(self, client, create_prerequisite_chain):
        """Test filtering courses by level."""
        # Test 100-level courses
        response = client.get("/courses/by-level/100")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 2  # MATH101, CS101
        
        course_ids = [course["course_id"] for course in data]
        assert "MATH101" in course_ids
        assert "CS101" in course_ids
        assert "CS301" not in course_ids  # Should not include 300-level course
        
        # Test 400-level courses
        response = client.get("/courses/by-level/400")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1  # CS450
        
        course_ids = [course["course_id"] for course in data]
        assert "CS450" in course_ids
        assert "CS101" not in course_ids  # Should not include 100-level course

class TestPrerequisitesAndDependencies:
    """Tests for prerequisites and dependency resolution."""
    
    def test_course_prerequisites(self, client, create_prerequisite_chain):
        """Test that course prerequisites are correctly stored and retrieved."""
        # Check CS201 prerequisites
        response = client.get("/courses/CS201")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["prerequisites"]) == 2
        assert "CS101" in data["prerequisites"]
        assert "MATH101" in data["prerequisites"]
        
        # Check CS450 prerequisites
        response = client.get("/courses/CS450")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["prerequisites"]) == 1
        assert "CS301" in data["prerequisites"]
    
    def test_resolve_dependencies(self, client, create_prerequisite_chain):
        """Test resolving the full dependency tree for a course."""
        # Check CS450 dependency tree (should include CS301, CS201, CS101, MATH201, MATH101)
        response = client.get("/courses/CS450/dependencies")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check direct prerequisite
        assert data["course_id"] == "CS450"
        assert len(data["prerequisites"]) == 1
        assert data["prerequisites"][0]["course_id"] == "CS301"
        
        # Check next level prerequisites (CS301 requires CS201 and MATH201)
        cs301_prereqs = data["prerequisites"][0]["prerequisites"]
        assert len(cs301_prereqs) == 2
        
        # Get the prerequisites by course_id
        cs201_data = next((p for p in cs301_prereqs if p["course_id"] == "CS201"), None)
        math201_data = next((p for p in cs301_prereqs if p["course_id"] == "MATH201"), None)
        
        assert cs201_data is not None
        assert math201_data is not None
        
        # Verify CS201 prerequisites (CS101 and MATH101)
        assert len(cs201_data["prerequisites"]) == 2
        cs201_prereq_ids = [p["course_id"] for p in cs201_data["prerequisites"]]
        assert "CS101" in cs201_prereq_ids
        assert "MATH101" in cs201_prereq_ids
    
    def test_check_prerequisites_met(self, client, create_prerequisite_chain):
        """Test checking if prerequisites are met for a course."""
        # Test with all prerequisites met
        response = client.post(
            "/courses/CS301/check-prerequisites",
            json=["CS201", "MATH201", "CS101", "MATH101"]
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["met"] == True
        assert len(data["missing"]) == 0
        
        # Test with some prerequisites missing
        response = client.post(
            "/courses/CS301/check-prerequisites",
            json=["CS201"]  # Missing MATH201
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["met"] == False
        assert len(data["missing"]) == 1
        assert data["missing"][0]["course_id"] == "MATH201"
        
        # Test with all prerequisites missing
        response = client.post(
            "/courses/CS301/check-prerequisites",
            json=[]
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["met"] == False
        assert len(data["missing"]) == 2
        missing_ids = [course["course_id"] for course in data["missing"]]
        assert "CS201" in missing_ids
        assert "MATH201" in missing_ids 