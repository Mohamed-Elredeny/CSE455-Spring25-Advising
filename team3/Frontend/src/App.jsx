import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import NotesList from "./pages/NotesList";
import NoteDetail from "./pages/NoteDetail";  // Make sure to import this
import StudentAnalytics from "./pages/StudentAnalytics";
import AdvisorAnalytics from './pages/AdvisorAnalytics';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="/notes/:id" element={<NoteDetail />} />  {/* Add this route */}
        <Route path="/analytics" element={<StudentAnalytics />} />
        <Route path="/advisor-analytics" element={<AdvisorAnalytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;