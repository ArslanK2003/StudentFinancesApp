import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import budgetIcon from "../../assets/img/budget-icon.avif";
import transactionsIcon from "../../assets/img/transactions-icon.png";
import insightsIcon from "../../assets/img/insights-icon.jpg";
import goalsIcon from "../../assets/img/goals-icon.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      navigate("/login");
    } else {
      setUsername(storedUsername || "User");
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2 className="welcome-text">Hello, {username} 👋</h2>

      <div className="dashboard-grid">
        <div 
          className="card" 
          style={{ backgroundImage: `url(${budgetIcon})` }} 
          onClick={() => navigate("/budget")}
        >
          <div className="overlay">Budget</div>
        </div>
        <div 
          className="card" 
          style={{ backgroundImage: `url(${transactionsIcon})` }} 
          onClick={() => navigate("/transactions")}
        >
          <div className="overlay">Transactions</div>
        </div>
        <div 
          className="card" 
          style={{ backgroundImage: `url(${insightsIcon})` }} 
          onClick={() => navigate("/insights")}
        >
          <div className="overlay">Insights</div>
        </div>
        <div 
          className="card" 
          style={{ backgroundImage: `url(${goalsIcon})` }} 
          onClick={() => navigate("/goals")}
        >
          <div className="overlay">Goals</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
