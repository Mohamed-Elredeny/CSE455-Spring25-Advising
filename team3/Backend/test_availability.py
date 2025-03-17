from services.availability_service import get_available_slots

# Example advisor ID and date
advisor_id = "A1001"
date = "2025-03-20"


# Call the function
available_slots = get_available_slots(advisor_id, date)

# Print the output
print("Available Slots:", available_slots)
