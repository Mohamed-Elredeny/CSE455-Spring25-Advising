# Grade Simulator Backend

This is the backend service for the Grade Simulator application.

## Architecture

The application follows a layered architecture:

1. **Express Backend**: Handles business logic, calculations, and REST API endpoints
2. **Python Service**: Retrieves data from the database and provides it to Express
3. **MySQL Database**: Stores all application data

### Data Flow

1. Express backend receives requests from the frontend
2. Express makes HTTP requests to the Python service to fetch data
3. Python service queries the database and returns the raw data
4. Express processes the data, performs calculations, and sends responses to the frontend

## Running the Application

### Prerequisites

- Node.js and npm
- Python 3.8+
- MySQL database

### Setup

1. Install Express dependencies:
```bash
npm install
```

2. Setup the Python service:
```bash
cd dummy_data
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the `dummy_data` directory with your database settings:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=grade_simulator
FLASK_ENV=development
FLASK_DEBUG=1
```

### Starting the Services

1. Start the Python service:
```bash
cd dummy_data
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. Start the Express backend (in a separate terminal):
```bash
npm start
```

The Express backend will now make API calls to the Python service to fetch data, then perform calculations and business logic operations with that data.

## API Documentation

The Express backend exposes various endpoints for the frontend:

- `/simulator/students/:student_id/cgpa` - Calculate the CGPA for a student
- `/simulator/students/:student_id/simulate-retake` - Simulate course retake
- `/simulator/students/:student_id/program-courses` - Get all courses for a student's program

And many more. The Express backend then communicates with the Python service to retrieve the necessary data for these endpoints. 