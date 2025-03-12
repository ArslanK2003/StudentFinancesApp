import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import "./Budget.css";

const Budget = () => {
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [categories, setCategories] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/budget?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch budget data");
  
        const data = await response.json();
        console.log("📊 Budget Data:", data); // Debugging Line
  
        setBudget(data.budget);
        setSpent(data.spent);
        setRemaining(data.budget - data.spent);

        // ✅ Ensure categories have all required values
        const updatedCategories = (data.categories || []).map(category => ({
          ...category,
          remaining: category.remaining ?? category.allocated - category.spent, // Calculate if missing
          icon: category.icon ?? getCategoryIcon(category.name) // Assign default icon
        }));
        setCategories(updatedCategories);
  
        // ✅ Ensure spendingTrends is valid
        const validTrends = Array.isArray(data.spendingTrends)
          ? data.spendingTrends.filter(item => item.day && item.amount)
          : [];
        setSpendingTrends(validTrends);
      } catch (error) {
        console.error("❌ Error fetching budget data:", error);
      }
    };
  
    fetchBudgetData();
  }, [userId]);  

  const progress = (spent / budget) * 100;

  // ✅ Function to Assign Default Icons Based on Category Name
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Food": "🍔",
      "Entertainment": "🎮",
      "Transport": "🚗",
      "Housing": "🏠",
      "Health & Wellness": "💊",
      "Personal Care": "🛀",
      "Technology": "💻",
      "Education": "📚",
      "Miscellaneous": "🔹"
    };
    return icons[categoryName] || "❓"; // Default icon if not found
  };

  return (
    <div className="budget-container">
      <h2>📊 Budget</h2>

      {/* Budget Overview */}
      <div className="budget-overview">
        <p><strong>This Month's Budget:</strong> £{budget}</p>
        <p>Spent: <span className="spent">£{spent}</span></p>
        <p>Remaining: <span className="remaining">£{remaining}</span></p>

        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">Progress: {progress.toFixed(1)}% spent</p>
      </div>

      {/* Budget Table */}
      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Allocated (£)</th>
            <th>Spent (£)</th>
            <th>Remaining (£)</th>
            <th>Icon</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <tr key={index}>
                <td>{category.name}</td>
                <td>£{category.allocated}</td>
                <td>£{category.spent}</td>
                <td>£{category.remaining}</td>
                <td>{category.icon}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data-message">⚠️ No budget categories found. Please set your budget.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Daily Spending Trends */}
      <h3>📈 Daily Spending Trends</h3>
      {spendingTrends.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={spendingTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: "Day of the Month", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Spending (£)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#FF5733" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="no-data-message">📉 No spending data available for this month.</p>
      )}

      {/* Set Budget for Next Month */}
      <Link to="/setbudget" className="set-budget-btn">Set Budget for Next Month</Link>
    </div>
  );
};

export default Budget;
