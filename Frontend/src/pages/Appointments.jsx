import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import {
  Container,
  Title,
  StyledCalendar,
  AppointmentList,
  AppointmentItem,
  EditButton,
  CancelButton,
} from "../pages/AppointmentsPageStyles";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/`);
      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setAppointments(appointments.filter((appt) => appt._id !== appointmentId));
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  const handleEdit = async (appointmentId) => {
    const newReason = prompt("Enter new reason:");
    if (!newReason) return;

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: newReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      setAppointments(
        appointments.map((appt) =>
          appt._id === appointmentId ? { ...appt, reason: newReason } : appt
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const tileClassName = ({ date }) => {
    return appointments.some(
      (appt) =>
        new Date(appt.date_time).toDateString() === date.toDateString()
    )
      ? "appointment-day"
      : "";
  };

  const selectedAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time).toDateString() === selectedDate.toDateString()
  );

  return (
    <Container>
      <Title>Appointments Calendar</Title>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <StyledCalendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      <div>
        <h3>Appointments on {selectedDate.toDateString()}</h3>
        {selectedAppointments.length > 0 ? (
          <AppointmentList>
            {selectedAppointments.map((appointment) => (
              <AppointmentItem key={appointment._id}>
                <strong>Advisor:</strong> {appointment.advisor_id} <br />
                <strong>Time:</strong> {new Date(appointment.date_time).toLocaleTimeString()} <br />
                <strong>Reason:</strong> {appointment.reason || "N/A"} <br />
                <strong>Status:</strong> {appointment.status}
                <div>
                  <EditButton onClick={() => handleEdit(appointment._id)}>Edit</EditButton>
                  <CancelButton onClick={() => handleCancel(appointment._id)}>Cancel</CancelButton>
                </div>
              </AppointmentItem>
            ))}
          </AppointmentList>
        ) : (
          <p>No appointments for this day.</p>
        )}
      </div>
    </Container>
  );
};

export default AppointmentsPage;
