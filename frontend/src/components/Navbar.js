import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../components/Navbar.css";
import logo from "../img/logo.png"; // Ensure the correct path to the logo

const Navbar = ({ handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pages that should NOT show the Navbar
  const hiddenRoutes = ["/", "/dashboard", "/login", "/signup"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="logo-container">
        <img src={logo} alt="SmartSpend Logo" className="logo" />
        <span className="logo-text">SmartSpend</span>
      </Link>
      <div className="nav-links">
        <Link to="/budget" className={location.pathname === "/budget" ? "active" : ""}>Budget</Link>
        <Link to="/transactions" className={location.pathname === "/transactions" ? "active" : ""}>Transactions</Link>
        <Link to="/insights" className={location.pathname === "/insights" ? "active" : ""}>Insights</Link>
        <Link to="/goals" className={location.pathname === "/goals" ? "active" : ""}>Goals</Link>
      </div>
      <div className="settings-logout">
        <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>⚙ Settings</Link>
        <button className="logout-btn" onClick={() => {
          handleLogout();
          navigate("/login");
        }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
