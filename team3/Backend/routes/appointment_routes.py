# Task 2 :CRUD APIS
#Task 3 week6: Reminder system
from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.appointment import Appointment
from services.appointment_service import book_appointment, get_appointment,get_all_appointments, update_appointment, delete_appointment, confirm_appointment, reject_appointment
from services.reminder_service import send_email_reminder
from datetime import datetime, timedelta

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

