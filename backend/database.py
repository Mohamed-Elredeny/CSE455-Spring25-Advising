from pymongo import MongoClient
from decouple import config

MONGO_URI = config("MONGO_URI", default="mongodb://localhost:27017")
DATABASE_NAME = config("DATABASE_NAME", default="advising_app")

client = MongoClient(MONGO_URI)
database = client[DATABASE_NAME]
notification_collection = database["notifications"]
notification_groups_collection = database["notification_groups"]
notification_preferences_collection = database["notification_preferences"]

def check_connection():
    try:
        client.server_info()
        print("MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise