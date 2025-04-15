import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const NotesList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/appointments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setAppointments(res.data.filter(appt => appt.notes)); // Only show appointments with notes
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notes-container">
      <h1>Meeting Notes</h1>
      <div className="notes-grid">
        {appointments.map((appt) => (
          <div key={appt._id} className="note-card">
            <h3>{appt.notes?.summary || "No title"}</h3>
            <p>With: {appt.advisor_name}</p>
            <p>Date: {new Date(appt.date_time).toLocaleString()}</p>
            <Link to={`/notes/${appt._id}`} className="view-btn">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;