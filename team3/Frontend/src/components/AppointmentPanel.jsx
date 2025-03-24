import React, { useState } from "react";
import {
  PanelContainer,
  Overlay,
  CloseButton,
  Form,
  Input,
  Select,
  SubmitButton
} from "../components/AppointmentPanelStyles"; // Adjust path if needed

const API_BASE_URL = "http://localhost:8000/api"; // Adjust FastAPI URL if needed

const AppointmentPanel = ({ isOpen, onClose }) => {
  const [appointmentData, setAppointmentData] = useState({
    student_id: "",
    advisor_id: "",
    date_time: "",
    reason: "",
    recurrence: "None" // Default: No recurrence
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update input fields on change
  const handleChange = (e) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  // Function to send appointment data to FastAPI
  const bookAppointment = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to book appointment");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Convert date_time to ISO format required by FastAPI
    const formattedData = {
      student_id: appointmentData.student_id,
      advisor_id: appointmentData.advisor_id,
      date_time: new Date(appointmentData.date_time).toISOString(), // Ensures correct format
      status: "Scheduled", // FastAPI expects status
      reason: appointmentData.reason || null,
      recurring: appointmentData.recurrence === "None" ? false : true, // Send recurrence only if set
      recurrence_pattern: appointmentData.recurrence === "None" ? null : appointmentData.recurrence,
      // recurrence_end_date: appointmentData.recurrence === "None" ? null : new Date(appointmentData.recurrence_end_date).toISOString()
    };

    console.log("Submitting appointment:", formattedData); // Debugging

    try {
      const result = await bookAppointment(formattedData);
      console.log("Appointment booked successfully:", result);
      setSuccess(`Appointment booked successfully! ${appointmentData.recurrence !== "None" ? `Recurring: ${appointmentData.recurrence}` : ""}`);

      // Reset form after success
      setAppointmentData({ student_id: "", advisor_id: "", date_time: "", reason: "", recurrence: "None" });

      // Close panel after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(error.message);
      console.error("Failed to book appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <PanelContainer isOpen={isOpen}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>Book an Appointment</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="student_id"
            placeholder="Student ID"
            value={appointmentData.student_id}
            onChange={handleChange}
            required
          />
          <Select
            name="advisor_id"
            value={appointmentData.advisor_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Advisor</option>
            <option value="1">Advisor 1</option>
            <option value="2">Advisor 2</option>
          </Select>
          <Input
            type="datetime-local"
            name="date_time"
            value={appointmentData.date_time}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="reason"
            placeholder="Reason (Optional)"
            value={appointmentData.reason}
            onChange={handleChange}
          />

          {/* Recurrence Dropdown */}
          <Select
            name="recurrence"
            value={appointmentData.recurrence}
            onChange={handleChange}
          >
            <option value="None">No Recurrence</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </Select>
          <Input
            type="datetime-local"
            name="date_time"
            value={appointmentData.recurrence_end_date}
            onChange={handleChange}
            required
          />
          <SubmitButton type="submit" disabled={loading || !appointmentData.student_id || !appointmentData.advisor_id || !appointmentData.date_time}>
            {loading ? "Booking..." : "Confirm Appointment"}
          </SubmitButton>
        </Form>
      </PanelContainer>
    </>
  );
};

export default AppointmentPanel;
