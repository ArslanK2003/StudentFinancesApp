import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/img/logo.png"; // ✅ Corrected path

const Navbar = () => {
  const location = useLocation(); // 🔍 Get current route

  // ❌ Hide Navbar on these pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="logo-container">
        <img src={logo} alt="SmartSpend Logo" className="logo" />
        <span className="logo-text">SmartSpend</span>
      </Link>
      <div className="nav-links">
        <Link to="/budget">Budget</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/goals">Goals</Link>
      </div>
      <div className="settings-box">
        <Link to="/settings">⚙ SETTINGS</Link>
      </div>
    </nav>
  );
};

export default Navbar;
