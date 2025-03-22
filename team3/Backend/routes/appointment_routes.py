# Task 2 :CRUD APIS

from fastapi import APIRouter, HTTPException
from models.appointment import Appointment
from services.appointment_service import book_appointment, get_appointment,get_all_appointments, update_appointment, delete_appointment

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
