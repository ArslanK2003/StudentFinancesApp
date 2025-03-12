import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Insights.css";

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const userId = localStorage.getItem("user_id");
  const [budget, setBudget] = useState(null);
  const [predictedSpending, setPredictedSpending] = useState(null);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/ml/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setPredictedSpending(data.predicted_spending);
        setBudget(data.budget); // ✅ Ensure we properly store budget data
        setFeedback(data.feedback);
      } catch (error) {
        console.error("❌ Error fetching predictions:", error);
      }
    };

    fetchPredictions();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insightsResponse = await fetch(`http://localhost:5001/api/insights?user_id=${userId}`);
        if (!insightsResponse.ok) throw new Error("Failed to fetch insights");
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);

        // ✅ Fetch Budget Data Separately
        const budgetResponse = await fetch(`http://localhost:5001/api/budget?user_id=${userId}`);
        if (!budgetResponse.ok) throw new Error("Failed to fetch budget");
        const budgetData = await budgetResponse.json();
        setBudget(budgetData); // ✅ Properly storing full budget data
      } catch (error) {
        console.error("❌ Error fetching insights or budget:", error);
      }
    };

    fetchData();
  }, [userId]);

  if (!insights) return <p>Loading insights...</p>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF"];

  return (
    <div className="insights-container">
      <h2>📊 Financial Insights</h2>
      <div className="insights-summary">
        <p>📌 <strong>Highest Spending:</strong> {insights.highestSpendingCategory}</p>
        <p>💰 <strong>Daily Average Spending:</strong> £{insights.dailyAverageSpending}</p>
        <p>🔍 <strong>Largest Transaction:</strong> £{insights.largestTransaction.amount} ({insights.largestTransaction.date})</p>

        {/* ✅ Updated Budget Handling */}
        <p>💰 <strong>Saving Opportunities:</strong> 
          {budget ? (
            !isNaN(budget.budget) && !isNaN(budget.spent) ? (
              budget.budget - budget.spent > 0 ? (
                <>You have £{(budget.budget - budget.spent).toFixed(2)} left in your budget. Consider allocating some of it to savings.</>
              ) : budget.budget - budget.spent === 0 ? (
                <>You have no remaining budget for this month.</>
              ) : (
                <>⚠️ You have overspent by £{Math.abs(budget.budget - budget.spent).toFixed(2)}. Consider adjusting your budget next month.</>
              )
            ) : (
              <>⚠️ Budget data appears to be incomplete. Please check your budget settings.</>
            )
          ) : (
            <>⚠️ No budget data found. Set up your budget to track expenses better.</>
          )}
        </p>
      </div>

      {/* 🔮 Future Spending Insights */}
      <h2>📊 Future Spending Insights</h2>
      <div className="prediction-card">
        <h3>🔮 Predicted Monthly Spending: <span>£{predictedSpending}</span></h3>
        <p>📉 Budget: <b>£{budget ? budget.budget : "N/A"}</b></p>

        <div className="feedback">
          {feedback.length > 0 ? feedback.map((msg, index) => <p key={index}>⚠️ {msg}</p>) : <p>No warnings detected.</p>}
        </div>
      </div>

      {/* 📈 Spending Trends Chart */}
      <h3>📈 Spending Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={insights.spendingTrends}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#FF5733" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* 🧩 Spending Distribution */}
      <h3>🧩 Spending Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={insights.spendingDistribution} dataKey="value" outerRadius={100} fill="#8884d8">
            {insights.spendingDistribution.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* 📊 Monthly Breakdown */}
      <h3>📊 Monthly Spending Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={insights.spendingDistribution}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* 💡 AI-Generated Insights */}
      <h3>💡 AI-Generated Insights</h3>
      <div className="insights-advice">
        {insights.recommendations.length > 0 ? (
          insights.recommendations.map((insight, index) => (
            <p key={index}>🧠 <strong>{insight.split(":")[0]}</strong>: {insight.split(":")[1]}</p>
          ))
        ) : (
          <p>No AI insights available at the moment.</p>
        )}
        <p>🔎 <strong>Spending Patterns:</strong> Your biggest expense is {insights.highestSpendingCategory}. Consider reducing discretionary spending.</p>
        <p>📉 <strong>High-Risk Spending:</strong> Your spending in {insights.highestSpendingCategory} is above 50% of your total budget.</p>
        <p>🔄 <strong>Recurring Expenses:</strong> Detecting patterns can help optimize savings. Consider automating payments to manage cash flow.</p>
      </div>
    </div>
  );
};

export default Insights;
