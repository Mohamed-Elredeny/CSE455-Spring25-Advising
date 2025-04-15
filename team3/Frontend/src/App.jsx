import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import NotesList from "./pages/NotesList";  
import StudentAnalytics from "./pages/StudentAnalytics";
import AdvisorAnalytics from './pages/AdvisorAnalytics';



const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="/analytics" element={<StudentAnalytics />} />
        <Route path="/advisor-analytics" element={<AdvisorAnalytics />} />
      </Routes>
    </Router>
  );
};

export default App;
