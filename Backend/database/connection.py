from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017")
DB_NAME = os.getenv("DATABASE_NAME", "advising_system")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]  # Connect to the database
appointments_collection = db["appointments"]
availability_collection = db["availability"]
