import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config"; // Ensure API URL is set
import "./AppointmentsPage.css";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
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

  return (
    <div className="appointments-container">
      <h2>All Appointments</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {appointments.length > 0 ? (
        <ul className="appointments-list">
          {appointments.map((appointment) => (
            <li key={appointment._id} className="appointment-item">
              <div>
                <strong>Student ID:</strong> {appointment.student_id} <br />
                <strong>Advisor:</strong> {appointment.advisor_id} <br />
                <strong>Date:</strong> {new Date(appointment.date_time).toLocaleString()} <br />
                <strong>Reason:</strong> {appointment.reason || "N/A"} <br />
                <strong>Status:</strong> {appointment.status}
              </div>
              <div className="buttons">
                <button className="edit-btn" onClick={() => handleEdit(appointment._id)}>Edit</button>
                <button className="cancel-btn" onClick={() => handleCancel(appointment._id)}>Cancel</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No appointments found.</p>
      )}
    </div>
  );
};

export default AppointmentsPage;
