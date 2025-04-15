import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [formData, setFormData] = useState({
    summary: "",
    action_items: [],
    follow_up: ""
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setAppointment(res.data);
        setFormData(res.data.notes || {});
      } catch (error) {
        console.error("Error fetching appointment:", error);
        navigate("/notes");
      }
    };
    fetchAppointment();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:8000/api/appointments/${id}/notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      navigate("/notes");
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  if (!appointment) return <div className="loading">Loading...</div>;

  return (
    <div className="note-detail-container">
      <h2>Meeting Notes</h2>
      <div className="note-meta">
        <p>Advisor: {appointment.advisor_name}</p>
        <p>Date: {new Date(appointment.date_time).toLocaleString()}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Summary:</label>
          <input
            type="text"
            value={formData.summary || ""}
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Action Items (comma separated):</label>
          <input
            type="text"
            value={formData.action_items?.join(", ") || ""}
            onChange={(e) => 
              setFormData({
                ...formData,
                action_items: e.target.value.split(",").map(item => item.trim())
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Follow-up Date:</label>
          <input
            type="datetime-local"
            value={formData.follow_up || ""}
            onChange={(e) => setFormData({...formData, follow_up: e.target.value})}
          />
        </div>

        <button type="submit" className="save-btn">Save Notes</button>
      </form>
    </div>
  );
};

export default NoteDetail;