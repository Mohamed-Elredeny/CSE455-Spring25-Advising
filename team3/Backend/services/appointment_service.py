from database.connection import appointments_collection
from models.appointment import Appointment
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from fastapi import HTTPException


# Ensure Unique Index for Advisor and DateTime (Run Once)
appointments_collection.create_index([("advisor_id", 1), ("date_time", 1)], unique=True)

from database.connection import appointments_collection

def get_all_appointments():
    """Retrieve all appointments from the database."""
    appointments = list(appointments_collection.find())
    for appointment in appointments:
        appointment["_id"] = str(appointment["_id"])  # Convert ObjectId to string
    return appointments

def create_appointment(appointment: dict):
    """Insert a new appointment into the database."""
    try:
        result = appointments_collection.insert_one(appointment)
        return {"message": "Appointment created", "id": str(result.inserted_id)}, 201
    except DuplicateKeyError:
        return {"error": "This time slot is already booked for this advisor."}, 400

def get_appointment(appointment_id: str):
    """Retrieve an appointment by its ID."""
    appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if appointment:
        appointment["_id"] = str(appointment["_id"])
    return appointment

def update_appointment(appointment_id: str, update_data: dict):
    """Update an existing appointment."""
    result = appointments_collection.update_one({"_id": ObjectId(appointment_id)}, {"$set": update_data})
    return {"message": "Appointment updated", "modified_count": result.modified_count}

def delete_appointment(appointment_id: str):
    """Delete an appointment by ID."""
    result = appointments_collection.delete_one({"_id": ObjectId(appointment_id)})
    return {"message": "Appointment deleted", "deleted_count": result.deleted_count}

def book_appointment(appointment_data: dict):
    """Book an appointment while preventing double booking."""
    try:
        # Ensure `date_time` is stored as a datetime object
        if isinstance(appointment_data["date_time"], str):
            appointment_data["date_time"] = datetime.fromisoformat(appointment_data["date_time"])

        # Insert the appointment (MongoDB will enforce uniqueness)
        result = appointments_collection.insert_one(appointment_data)
        return {"message": "Appointment booked successfully!", "id": str(result.inserted_id)}, 201

    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="This time slot is already booked for this advisor.")