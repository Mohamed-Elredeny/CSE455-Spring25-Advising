import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notesText, setNotesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setAppointment(res.data);
        setNotesText(res.data.notes?.content || "");
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/appointments/${id}/notes`,
        { content: notesText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("Save successful:", response.data);
      navigate("/notes");
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!appointment) return <div className="error">Appointment not found</div>;

  return (
    <div className="note-detail-container">
      <h2>{appointment.notes ? "Edit Notes" : "Add Notes"}</h2>
      <div className="note-meta">
        <p>With: {appointment.advisor_name}</p>
        <p>Date: {new Date(appointment.date_time).toLocaleString()}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Write your notes here..."
            className="notes-textarea"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate("/notes")}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteDetail;