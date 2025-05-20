#!/bin/bash
# Test API endpoints for the Course Service

set -e

# Assign the service URL
SERVICE_URL="http://localhost:8000"

# Function for making API calls with pretty output
function call_api {
    endpoint=$1
    method=${2:-GET}
    data=${3:-""}

    echo -e "\n\033[1;36m=== Testing $method $endpoint ===\033[0m"
    
    if [ -z "$data" ]; then
        # GET request
        response=$(curl -s -X $method "$SERVICE_URL$endpoint")
    else 
        # POST/PUT request with data
        response=$(curl -s -X $method "$SERVICE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    fi

    # Print response
    echo $response | python3 -m json.tool || echo $response
    
    echo -e "\033[1;32m=== End of $method $endpoint ===\033[0m"
}

echo -e "\033[1;33m===================================\033[0m"
echo -e "\033[1;33m|| Course Service API Test Suite ||\033[0m"
echo -e "\033[1;33m===================================\033[0m"
echo -e "Testing against service at: $SERVICE_URL"

# Test root endpoint
call_api "/"

# Test GET courses
call_api "/courses"

# Test category endpoints
call_api "/categories"

# Test course search with a parameter
call_api "/courses/search?query=computer"

# Check service health
call_api "/health"

# Test documentation endpoints
echo -e "\n\033[1;36m=== API Documentation URLs ===\033[0m"
echo "$SERVICE_URL/docs"
echo "$SERVICE_URL/redoc"
echo "$SERVICE_URL/openapi.json"

echo -e "\n\033[1;33m===================================\033[0m"
echo -e "\033[1;32m|| API Testing Complete ||\033[0m"
echo -e "\033[1;33m===================================\033[0m"
