import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="aiu">AIU.</span>
          <span className="alamein">ALAMEIN INTERNATIONAL UNIVERSITY</span>
        </Link>
        <ul className={`nav-menu ${isOpen ? "open" : ""}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/appointments">Appointments</Link></li>
        </ul>
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>☰</div>
      </div>
    </nav>
  );
};

export default Navbar;
