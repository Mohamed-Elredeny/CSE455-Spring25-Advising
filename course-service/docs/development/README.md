# Development Guide

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Kubernetes (for deployment)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/CSE455-Spring25-Advising.git
cd CSE455-Spring25-Advising
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On Unix or MacOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set Up Local Database

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d
```

### 4. Run Database Migrations

```bash
# Apply database migrations
alembic upgrade head
```

### 5. Run the Application

```bash
# Start the development server
uvicorn app.main:app --reload
```

The application will be available at `http://localhost:8000`

## Project Structure

```
.
├── app/
│   ├── crud/          # Database operations
│   ├── database/      # Database configuration
│   ├── models/        # SQLAlchemy models
│   ├── routers/       # API endpoints
│   ├── schemas/       # Pydantic models
│   └── utils/         # Utility functions
├── tests/             # Test files
├── alembic/           # Database migrations
├── k8s/               # Kubernetes configurations
└── scripts/           # Utility scripts
```

## Development Workflow

### 1. Code Style

- Follow PEP 8 guidelines
- Use type hints
- Document all public functions and classes
- Keep functions small and focused

### 2. Git Workflow

1. Create a new branch for your feature
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them
```bash
git add .
git commit -m "Description of your changes"
```

3. Push your changes
```bash
git push origin feature/your-feature-name
```

4. Create a pull request

### 3. Testing

Run tests before submitting a pull request:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_courses.py

# Run with coverage
pytest --cov=app
```

### 4. Database Migrations

When making changes to the database schema:

1. Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

2. Review the generated migration file
3. Apply the migration
```bash
alembic upgrade head
```

## API Development

### Adding New Endpoints

1. Create a new router file in `app/routers/` if needed
2. Define the endpoint using FastAPI decorators
3. Add input validation using Pydantic models
4. Implement the business logic in the CRUD layer
5. Add tests for the new endpoint

### Example: Adding a New Endpoint

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import YourModel
from app.crud import your_crud

router = APIRouter()

@router.post("/your-endpoint", response_model=YourModel)
def create_your_model(
    model: YourModel,
    db: Session = Depends(get_db)
):
    return your_crud.create_model(db=db, model=model)
```

## Debugging

### Logging

The application uses Python's logging module. Configure logging in your development environment:

```python
import logging

logging.basicConfig(level=logging.DEBUG)
```

### Debug Mode

Run the application in debug mode:

```bash
uvicorn app.main:app --reload --log-level debug
```

## Performance Optimization

1. Use database indexes for frequently queried fields
2. Implement caching for expensive operations
3. Use connection pooling
4. Optimize database queries

## Security Considerations

1. Validate all input data
2. Use parameterized queries
3. Implement proper error handling
4. Follow security best practices

## Documentation

1. Update API documentation when adding new endpoints
2. Document database schema changes
3. Update README files as needed
4. Add comments for complex logic

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check if PostgreSQL is running
   - Verify connection string
   - Check database permissions

2. **Migration Issues**
   - Check for conflicting migrations
   - Verify database state
   - Review migration files

3. **API Issues**
   - Check request/response format
   - Verify endpoint parameters
   - Check error logs

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Kubernetes Documentation](https://kubernetes.io/docs/) 