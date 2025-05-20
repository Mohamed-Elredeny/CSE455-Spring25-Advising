import aiosmtplib
from email.message import EmailMessage
from datetime import datetime, timedelta

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_USERNAME = "EMAIL_USERNAME"
EMAIL_PASSWORD = "EMAIL_PASSWORD"

async def send_email_reminder(student_email, appointment):
    """Send an email reminder for the appointment."""
    msg = EmailMessage()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = student_email
    msg["Subject"] = "Upcoming Advising Appointment Reminder"
    msg.set_content(f"Dear Student,\n\nYou have an upcoming advising appointment on {appointment.date_time}. Please be on time.\n\nBest,\nAdvising Team")

    try:
        await aiosmtplib.send(msg, hostname=SMTP_SERVER, port=SMTP_PORT, username=EMAIL_USERNAME, password=EMAIL_PASSWORD, use_tls=False)
        print(f"Reminder sent to {student_email}")
        await update_appointment_reminder_status(appointment.id, True)  # Mark as reminder sent
    except Exception as e:
        print(f"Failed to send email: {e}")