from app.core.database import Base, engine

# Drop all tables
print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)


print("Database reset complete!")