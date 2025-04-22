import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const NotesList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithoutNotes, setShowWithoutNotes] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/appointments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = showWithoutNotes
    ? appointments
    : appointments.filter(appt => appt.notes);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notes-container">
      <h1>Meeting Notes</h1>
      
      <div className="notes-controls">
        <button 
          onClick={() => setShowWithoutNotes(!showWithoutNotes)}
          className="toggle-btn"
        >
          {showWithoutNotes ? "Hide Meetings Without Notes" : "Show All Meetings"}
        </button>
      </div>

      <div className="notes-grid">
        {filteredAppointments.map((appt) => (
          <div key={appt._id} className="note-card">
            <div className="note-content">
              <h3>{appt.notes?.summary || "No notes yet"}</h3>
              <div className="note-meta">
                <p><strong>With:</strong> {appt.advisor_name}</p>
                <p><strong>Date:</strong> {new Date(appt.date_time).toLocaleString()}</p>
              </div>
            </div>
            <div className="note-actions">
              <Link to={`/notes/${appt._id}`} className="view-btn">
                {appt.notes ? "View/Edit Notes" : "Add Notes"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;