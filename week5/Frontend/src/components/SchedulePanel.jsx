import React, { useState, useEffect } from "react";
import {
  PanelContainer,
  Overlay,
  CloseButton,
  ScheduleList,
  ScheduleItem,
  NoAppointments
} from "../components/SchedulePanelStyles"; // Import styles
import { API_BASE_URL } from "../config"; // Ensure API URL is correctly set

const SchedulePanel = ({ isOpen, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all appointments from the API when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/`);
      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }
      const data = await response.json();
      setAppointments(data); // Assuming API returns an array
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <PanelContainer isOpen={isOpen}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>All Appointments</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {appointments.length > 0 ? (
          <ScheduleList>
            {appointments.map((appointment) => (
              <ScheduleItem key={appointment.id}>
                <strong>Student ID:</strong> {appointment.student_id} <br />
                <strong>Advisor:</strong> {appointment.advisor_id} <br />
                <strong>Date:</strong> {new Date(appointment.date_time).toLocaleString()} <br />
                <strong>Status:</strong> {appointment.status}
              </ScheduleItem>
            ))}
          </ScheduleList>
        ) : (
          !loading && <NoAppointments>No appointments found.</NoAppointments>
        )}
      </PanelContainer>
    </>
  );
};

export default SchedulePanel;
