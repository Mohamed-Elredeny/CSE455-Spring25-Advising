import React, { useState } from "react";
import AppointmentPanel from "../components/AppointmentPanel";
import SchedulePanel from "../components/SchedulePanel";
import "./Home.css";

const Home = () => {
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const studentId = "12345"; // Replace with actual logged-in student ID

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="aiu-title">AIU</h1>
        <h2 className="alamein-title">ALAMEIN INTERNATIONAL UNIVERSITY</h2>
        <p className="hero-text">
          Welcome to the AIU Advising System. Schedule appointments with academic advisors and plan your future today!
        </p>
        <div className="buttons">
          <button className="btn primary" onClick={() => setIsAppointmentOpen(true)}>Book an Appointment</button>
          <button className="btn secondary" onClick={() => setIsScheduleOpen(true)}>View Schedule</button>
        </div>
      </div>

      <AppointmentPanel isOpen={isAppointmentOpen} onClose={() => setIsAppointmentOpen(false)} />
      <SchedulePanel isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} studentId={studentId} />
    </div>
  );
};

export default Home;
