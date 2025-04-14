import subprocess
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migrations():
    """Run database migrations using alembic."""
    print("Running database migrations...")
    try:
        # Skip generating a new migration and just apply existing migrations
        result = subprocess.run(['alembic', 'upgrade', 'head'], 
                             check=True, capture_output=True, text=True)
        print(result.stdout)
        
        print("Database migrations completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running migrations: {e}")
        print(f"Output: {e.output}")
        print(f"Error: {e.stderr}")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1) 