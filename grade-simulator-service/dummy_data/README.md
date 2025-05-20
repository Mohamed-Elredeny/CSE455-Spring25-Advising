# Grade Simulator Python API Service

This service provides API endpoints for the Grade Simulator application to fetch data from the database. 
It acts as a middleware between the Express backend and the database.

## Purpose

The service retrieves raw data from the database and provides it to the Express backend via REST API endpoints. 
The Express backend continues to handle all business logic and calculations.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with database configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=grade_simulator
FLASK_ENV=development
FLASK_DEBUG=1
```

4. Run the service:
```bash
python app.py
```

The service will start on http://localhost:5000

## API Endpoints

- `/api/students` - Get all students
- `/api/students/<student_id>` - Get a specific student
- `/api/students/<student_id>/grades` - Get grades for a specific student
- `/api/courses` - Get all courses
- `/api/courses/<course_id>` - Get a specific course
- `/api/gpa-rules` - Get all GPA rules
- `/api/gpa-rules/<letter_grade>` - Get a specific GPA rule
- `/api/program-plans` - Get all program plans
- `/api/program-plans/<program_id>` - Get program plans for a specific program
- `/api/program-plans/<program_id>/<course_id>` - Get a specific program plan entry
- `/health` - Health check endpoint

## Integration with Express Backend

The Express backend now makes HTTP requests to this service instead of directly querying the database.
Configuration for these requests is defined in the Express backend's `config/pythonApi.js` file. 