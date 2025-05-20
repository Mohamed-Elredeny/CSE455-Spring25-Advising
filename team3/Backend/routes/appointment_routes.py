# Task 2 :CRUD APIS
#Task 3 week6: Reminder system
from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.appointment import Appointment
from services.appointment_service import book_appointment, get_appointment,get_all_appointments, update_appointment, delete_appointment, confirm_appointment, reject_appointment
from services.reminder_service import send_email_reminder
from datetime import datetime, timedelta
from typing import Optional, Dict


router = APIRouter()

@router.get("/appointments/")
def get_all_appointments_api():
    appointments = get_all_appointments()
    if not appointments:
        raise HTTPException(status_code=404, detail="No appointments found")
    return appointments

@router.post("/appointments/")
def create_appointment_api(appointment: Appointment):
    appointment_dict = appointment.dict()
    # appointment_id = create_appointment(appointment_dict)
    message = book_appointment(appointment_dict)
    return {"message": message}

@router.get("/appointments/{appointment_id}")
def get_appointment_api(appointment_id: str):
    appointment = get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/appointments/{appointment_id}")
def update_appointment_api(appointment_id: str, update_data: dict):
    modified_count = update_appointment(appointment_id, update_data)
    if modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment updated"}

@router.delete("/appointments/{appointment_id}")
def delete_appointment_api(appointment_id: str):
    deleted_count = delete_appointment(appointment_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}

@router.put("/appointments/{appointment_id}/confirm")
def confirm_appointment_api(appointment_id: str):
    """API endpoint for confirming an appointment."""
    return confirm_appointment(appointment_id)

@router.put("/appointments/{appointment_id}/reject")
def reject_appointment_api(appointment_id: str):
    """API endpoint for rejecting an appointment."""
    return reject_appointment(appointment_id)

@router.get("/send_reminders")
async def schedule_reminders(background_tasks: BackgroundTasks):
    """Check upcoming appointments and send reminders."""
    now = datetime.utcnow()
    reminder_time = now + timedelta(hours=24)  # Send reminders 24 hours before

    appointments =  get_all_appointments()
    for appointment in appointments:
        print(appointment)
        if not appointment['reminder_sent'] and appointment['date_time'] <= reminder_time:
            student_email = await get_student_email(appointment.student_id)
            if student_email:
                background_tasks.add_task(send_email_reminder, student_email, appointment)

    return {"message": "Reminders scheduled"}

# --- Meeting Notes Endpoints ---
@router.post("/appointments/{appointment_id}/notes", status_code=201)
async def add_or_update_notes(
    appointment_id: str,
    notes: Dict,  # Or use a Pydantic model like `NotesSchema`
):
    """
    Add/update meeting notes for an appointment.
    - `notes` format: {"summary": "...", "action_items": ["task1", ...]}
    """
    # Validate appointment exists and user has permission
    appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Optional: Check if current_user is advisor/student linked to this appointment
    if current_user["id"] not in [appointment["advisor_id"], appointment["student_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized to edit notes")
    
    # Update notes
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"notes": notes}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update notes")
    
    return {"message": "Notes updated successfully"}


@router.get("/appointments/{appointment_id}/notes")
async def get_notes(
    appointment_id: str,
):
    """Retrieve notes for an appointment."""
    appointment = appointments_collection.find_one(
        {"_id": ObjectId(appointment_id)},
        {"notes": 1, "advisor_id": 1, "student_id": 1}  # Project only needed fields
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Optional: Check permissions
    if current_user["id"] not in [appointment["advisor_id"], appointment["student_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized to view notes")
    
    return appointment.get("notes", {})


@router.delete("/appointments/{appointment_id}/notes")
async def clear_notes(
    appointment_id: str,):
    """Clear notes for an appointment (set to empty dict)."""
    # Validate appointment and permissions (same as above)
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"notes": {}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found or notes already empty")
    return {"message": "Notes cleared"}

