#!/bin/bash

echo "Testing service integration..."

# Test student service
echo "Testing student service..."
curl -X POST http://student-service/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "major": "Computer Science",
    "gpa": 3.8
  }'

# Get the created student
echo "Getting created student..."
curl http://student-service/api/students

# Test advisor service
echo "Testing advisor service..."
curl -X POST http://advisor-service/api/advisors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Advisor",
    "email": "advisor@example.com",
    "department": "Computer Science"
  }'

# Test frontend connection
echo "Testing frontend connection..."
curl http://frontend-service/

echo "Service integration test complete!" 