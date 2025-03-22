# Task 3: Availability algorithm
from datetime import datetime, timedelta
from database.connection import appointments_collection

def get_available_slots(advisor_id: str, date: str):
    """
    Returns a list of available 30-minute slots for a given advisor on a specific date.
    """
    # Define all possible time slots (30-minute intervals)
    start_time = datetime.strptime("09:00", "%H:%M")
    end_time = datetime.strptime("16:30", "%H:%M")
    all_slots = []

    # Generate slots from 09:00 to 16:30
    current_time = start_time
    while current_time <= end_time:
        all_slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=30)

    # Convert input date to a datetime object
    date_obj = datetime.strptime(date, "%Y-%m-%d")

    # Define the start and end datetime for filtering
    start_of_day = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0)
    end_of_day = datetime(date_obj.year, date_obj.month, date_obj.day, 23, 59, 59)

    # Fetch all booked appointments for this advisor on the given date
    booked_appointments = appointments_collection.find(
        {
            "advisor_id": advisor_id,
            "date_time": {
                "$gte": start_of_day,  # Start of the given date
                "$lt": end_of_day      # End of the given date
            }
        }
    )

    # Extract booked times
    booked_slots = []
    for appointment in booked_appointments:
        booked_time = appointment["date_time"].strftime("%H:%M")  # Extract time as HH:MM
        booked_slots.append(booked_time)

    print("Booked slots:", booked_slots)

    # Remove booked slots from the available list
    available_slots = [slot for slot in all_slots if slot not in booked_slots]

    return available_slots
