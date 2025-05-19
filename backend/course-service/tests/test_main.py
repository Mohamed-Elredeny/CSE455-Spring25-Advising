import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_read_root():
    """Test the root endpoint."""
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Welcome to the Course Management API"
    assert "docs" in response.json()
    assert "openapi" in response.json() 