# database.py
from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config

MONGO_URI = config("MONGO_URI", default="mongodb://localhost:27018")
DATABASE_NAME = config("DATABASE_NAME", default="advising_app")

client = AsyncIOMotorClient(MONGO_URI)
database = client[DATABASE_NAME]
notification_collection = database["notifications"]

notification_groups_collection = database.get_collection("notification_groups")
notification_preferences_collection = database.get_collection("notification_preferences")

async def check_connection():
    try:
        await client.server_info()
        print("MongoDB connection successful!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise