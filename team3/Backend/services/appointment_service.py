from database.connection import appointments_collection
from models.appointment import Appointment
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from fastapi import HTTPException
from pytz import timezone as pytz_timezone
from typing import Optional

# Timezone Configuration
DEFAULT_TIMEZONE = 'UTC'  # Storing all times in UTC is recommended
SERVER_TIMEZONE = 'America/New_York'  # Your server's local timezone

class TimezoneHandler:
    @staticmethod
    def to_utc(dt: datetime, input_tz: Optional[str] = None) -> datetime:
        """Convert any datetime to UTC for storage"""
        if dt.tzinfo is None:
            if input_tz:
                tz = pytz_timezone(input_tz)
                dt = tz.localize(dt)
            else:
                tz = pytz_timezone(SERVER_TIMEZONE)
                dt = tz.localize(dt)
        return dt.astimezone(pytz_timezone('UTC'))

    @staticmethod
    def from_utc(dt: datetime, output_tz: str) -> datetime:
        """Convert UTC datetime to specific timezone"""
        if dt.tzinfo is None:
            dt = pytz_timezone('UTC').localize(dt)
        return dt.astimezone(pytz_timezone(output_tz))

    @staticmethod
    def ensure_utc_naive(dt: datetime) -> datetime:
        """Ensure datetime is in UTC and naive (for MongoDB storage)"""
        if dt.tzinfo is not None:
            dt = dt.astimezone(pytz_timezone('UTC'))
        return dt.replace(tzinfo=None)

# Ensure Unique Index for Advisor and DateTime (Run Once)
appointments_collection.create_index([("advisor_id", 1), ("date_time", 1)], unique=True)

def get_all_appointments(timezone: Optional[str] = None):
    """Retrieve all appointments from the database with optional timezone conversion."""
    appointments = list(appointments_collection.find())
    for appointment in appointments:
        appointment["_id"] = str(appointment["_id"])
        if timezone and appointment.get("date_time"):
            utc_dt = pytz_timezone('UTC').localize(appointment["date_time"])
            appointment["date_time"] = TimezoneHandler.from_utc(utc_dt, timezone)
    return appointments

def create_appointment(appointment: dict):
    """Insert a new appointment into the database with timezone handling."""
    try:
        # Convert and validate datetime
        if isinstance(appointment["date_time"], str):
            appointment["date_time"] = datetime.fromisoformat(appointment["date_time"])
        
        appointment["date_time"] = TimezoneHandler.ensure_utc_naive(
            TimezoneHandler.to_utc(
                appointment["date_time"],
                appointment.get("timezone")
            )
        )
        
        result = appointments_collection.insert_one(appointment)
        return {"message": "Appointment created", "id": str(result.inserted_id)}, 201
    except DuplicateKeyError:
        return {"error": "This time slot is already booked for this advisor."}, 400
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_appointment(appointment_id: str, timezone: Optional[str] = None):
    """Retrieve an appointment by its ID with optional timezone conversion."""
    appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        return None
        
    appointment["_id"] = str(appointment["_id"])
    if timezone and appointment.get("date_time"):
        utc_dt = pytz_timezone('UTC').localize(appointment["date_time"])
        appointment["date_time"] = TimezoneHandler.from_utc(utc_dt, timezone)
    return appointment

def update_appointment(appointment_id: str, update_data: dict):
    """Update an existing appointment with timezone handling."""
    try:
        if "date_time" in update_data:
            if isinstance(update_data["date_time"], str):
                update_data["date_time"] = datetime.fromisoformat(update_data["date_time"])
            
            update_data["date_time"] = TimezoneHandler.ensure_utc_naive(
                TimezoneHandler.to_utc(
                    update_data["date_time"],
                    update_data.get("timezone")
                )
            )
        
        result = appointments_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": update_data}
        )
        return {"message": "Appointment updated", "modified_count": result.modified_count}
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="This time slot is already booked for this advisor."
        )

def delete_appointment(appointment_id: str):
    """Delete an appointment by ID."""
    result = appointments_collection.delete_one({"_id": ObjectId(appointment_id)})
    return {"message": "Appointment deleted", "deleted_count": result.deleted_count}

def book_appointment(appointment_data: dict):
    """Book an appointment while preventing double booking with timezone support."""
    try:
        # Ensure `date_time` is stored as a datetime object
        if isinstance(appointment_data["date_time"], str):
            appointment_data["date_time"] = datetime.fromisoformat(appointment_data["date_time"])

        # Convert to UTC for storage
        appointment_data["date_time"] = TimezoneHandler.ensure_utc_naive(
            TimezoneHandler.to_utc(
                appointment_data["date_time"],
                appointment_data.get("timezone")
            )
        )
        
        appointment_data["status"] = "pending"
        appointment_data["created_at"] = datetime.utcnow()

        # Insert the appointment
        result = appointments_collection.insert_one(appointment_data)
        return {"message": "Appointment booked successfully!", "id": str(result.inserted_id)}, 201
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="This time slot is already booked for this advisor."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
def confirm_appointment(appointment_id: str):
    """Advisor confirms an appointment."""
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "confirmed"}}
    )
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found or already confirmed."
        )
    return {"message": "Appointment confirmed successfully."}

def reject_appointment(appointment_id: str):
    """Advisor rejects an appointment."""
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "rejected"}}
    )
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found or already rejected."
        )
    return {"message": "Appointment rejected."}

def get_advisor_schedule(advisor_id: str, date: datetime, tz_str: Optional[str] = None):
    """Get advisor's schedule for a specific date with timezone handling."""
    try:
        # Convert input date to UTC range for query
        if tz_str:
            tz = pytz_timezone(tz_str)
            start_local = tz.localize(datetime.combine(date, datetime.min.time()))
            end_local = tz.localize(datetime.combine(date, datetime.max.time()))
        else:
            tz = pytz_timezone(SERVER_TIMEZONE)
            start_local = tz.localize(datetime.combine(date, datetime.min.time()))
            end_local = tz.localize(datetime.combine(date, datetime.max.time()))
        
        start_utc = start_local.astimezone(pytz_timezone('UTC'))
        end_utc = end_local.astimezone(pytz_timezone('UTC'))
        
        query = {
            "advisor_id": advisor_id,
            "date_time": {
                "$gte": start_utc.replace(tzinfo=None),
                "$lte": end_utc.replace(tzinfo=None)
            }
        }
        
        appointments = list(appointments_collection.find(query))
        
        # Convert back to requested timezone
        for appt in appointments:
            appt["_id"] = str(appt["_id"])
            if tz_str and appt.get("date_time"):
                utc_dt = pytz_timezone('UTC').localize(appt["date_time"])
                appt["date_time"] = TimezoneHandler.from_utc(utc_dt, tz_str)
        
        return appointments
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))