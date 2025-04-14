# Database Documentation

## Overview

The CSE455-Spring25-Advising service uses PostgreSQL as its primary database and Redis for caching. This document covers:

- Database schema
- Migrations
- Data models
- Relationships
- Indexes
- Caching strategy

## Schema

### Tables

#### 1. courses

```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    is_core BOOLEAN DEFAULT FALSE,
    level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. categories

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. sections

```sql
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    section_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    schedule_day VARCHAR(20) NOT NULL,
    schedule_time VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE (section_id, course_id)
);
```

#### 4. prerequisites

```sql
CREATE TABLE prerequisites (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    prerequisite_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE (course_id, prerequisite_id)
);
```

#### 5. course_categories

```sql
CREATE TABLE course_categories (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE (course_id, category_id)
);
```

## Indexes

### Courses Table
```sql
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_is_core ON courses(is_core);
```

### Sections Table
```sql
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_instructor ON sections(instructor);
```

### Prerequisites Table
```sql
CREATE INDEX idx_prerequisites_course_id ON prerequisites(course_id);
CREATE INDEX idx_prerequisites_prerequisite_id ON prerequisites(prerequisite_id);
```

## Relationships

1. **Course to Sections**
   - One-to-Many relationship
   - A course can have multiple sections
   - Sections are deleted when their course is deleted

2. **Course to Prerequisites**
   - Many-to-Many relationship
   - A course can have multiple prerequisites
   - A course can be a prerequisite for multiple courses

3. **Course to Categories**
   - Many-to-Many relationship
   - A course can belong to multiple categories
   - A category can contain multiple courses

## Migrations

The project uses Alembic for database migrations. Migration files are located in the `alembic/versions/` directory.

### Creating a New Migration

```bash
# Generate a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply the migration
alembic upgrade head
```

### Example Migration

```python
"""create courses table

Revision ID: 1234567890ab
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '1234567890ab'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'courses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('instructor', sa.String(length=255), nullable=False),
        sa.Column('credits', sa.Integer(), nullable=False),
        sa.Column('department', sa.String(length=50), nullable=False),
        sa.Column('is_core', sa.Boolean(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('course_id')
    )

def downgrade():
    op.drop_table('courses')
```

## Caching Strategy

### Redis Cache

Redis is used for caching frequently accessed data:

1. **Course Data**
   - Cache key: `course:{course_id}`
   - TTL: 1 hour
   - Cache invalidation on updates

2. **Category Data**
   - Cache key: `category:{category_id}`
   - TTL: 1 hour
   - Cache invalidation on updates

3. **Search Results**
   - Cache key: `search:{query}:{search_by}`
   - TTL: 30 minutes
   - Cache invalidation on data updates

### Cache Invalidation

Cache is invalidated when:
- Course is created/updated/deleted
- Category is created/updated/deleted
- Section is created/updated/deleted
- Prerequisites are modified

## Backup and Recovery

### Backup

```bash
# Create backup
pg_dump -U user -d advising > backup.sql

# Create backup with specific tables
pg_dump -U user -d advising -t courses -t categories > partial_backup.sql
```

### Recovery

```bash
# Restore from backup
psql -U user -d advising < backup.sql

# Restore specific tables
psql -U user -d advising -t courses -t categories < partial_backup.sql
```

## Performance Optimization

1. **Query Optimization**
   - Use appropriate indexes
   - Optimize JOIN operations
   - Use EXPLAIN ANALYZE for query analysis

2. **Connection Pooling**
   - Configure connection pool size
   - Monitor connection usage
   - Implement connection timeouts

3. **Caching**
   - Use Redis for frequently accessed data
   - Implement cache warming
   - Monitor cache hit rates

## Monitoring

### Database Metrics

1. **Performance Metrics**
   - Query execution time
   - Connection pool usage
   - Cache hit rate
   - Disk I/O

2. **Resource Usage**
   - CPU usage
   - Memory usage
   - Disk space
   - Network I/O

### Logging

1. **Query Logging**
   - Slow queries
   - Error queries
   - Connection issues

2. **Audit Logging**
   - Schema changes
   - Data modifications
   - User actions

## Security

1. **Access Control**
   - Role-based access
   - Schema permissions
   - Row-level security

2. **Data Protection**
   - Encryption at rest
   - Encryption in transit
   - Regular backups

3. **Audit Trail**
   - Track schema changes
   - Monitor data access
   - Log security events

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/) 