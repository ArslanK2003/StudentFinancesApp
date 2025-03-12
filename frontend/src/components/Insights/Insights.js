import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Insights.css";

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const userId = localStorage.getItem("user_id");
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insightsResponse = await fetch(`http://localhost:5001/api/insights?user_id=${userId}`);
        if (!insightsResponse.ok) throw new Error("Failed to fetch insights");
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);

        const budgetResponse = await fetch(`http://localhost:5001/api/budget?user_id=${userId}`);
        if (!budgetResponse.ok) throw new Error("Failed to fetch budget");
        const budgetData = await budgetResponse.json();
        setBudget(budgetData);
      } catch (error) {
        console.error("❌ Error fetching insights or budget:", error);
      }
    };

    fetchData();
  }, [userId]);


  if (!insights) return <p>Loading insights...</p>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF"];

  // ✅ Handle PDF Download
  const downloadInsights = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Financial Insights Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Highest Spending Category: ${insights.highestSpendingCategory}`, 20, 40);
    doc.text(`Lowest Spending Category: ${insights.lowestSpendingCategory}`, 20, 50);
    doc.text(`Daily Average Spending: £${insights.dailyAverageSpending}`, 20, 60);
    doc.text(`Largest Transaction: £${insights.largestTransaction.amount} (${insights.largestTransaction.date})`, 20, 70);
    doc.text(`Predicted Monthly Spending: £${insights.predicted_spending}`, 20, 80);

    doc.text("AI Recommendations:", 20, 100);
    insights.recommendations.forEach((rec, index) => {
      doc.text(`• ${rec}`, 20, 110 + index * 10);
    });

    doc.save("Financial_Insights.pdf");
  };

  return (
    <div className="insights-container">
      <h2>📊 Financial Insights</h2>

      {/* 🔹 Overview Section */}
      <div className="insights-summary">
        <p>📌 <strong>Highest Spending:</strong> {insights.highestSpendingCategory}</p>
        <p>💰 <strong>Daily Average Spending:</strong> £{insights.dailyAverageSpending}</p>
        <p>🔍 <strong>Largest Transaction:</strong> £{insights.largestTransaction.amount} ({insights.largestTransaction.date})</p>
        <p>
  💰    <strong>Saving Opportunities:</strong> 
          {budget && !isNaN(budget.budget) && !isNaN(budget.spent) ? (
            budget.budget - budget.spent > 0 ? (
              <>You have £{(budget.budget - budget.spent).toFixed(2)} left in your budget. Consider allocating some of it to savings.</>
            ) : budget.budget - budget.spent === 0 ? (
              <>You have no remaining budget for this month.</>
            ) : (
              <>⚠️ You have overspent by £{Math.abs(budget.budget - budget.spent).toFixed(2)}. Consider adjusting your budget next month.</>
            )
          ) : (
            <>⚠️ Unable to fetch budget data. Check if your budget is set.</>
          )}
        </p>
        </div>

      {/* 🔥 Budget Projection */}
      <h3>📊 Budget Projection</h3>
      <p className={insights.predicted_spending > insights.budget ? "budget-alert over-budget" : "budget-alert within-budget"}>
        {insights.predicted_spending > insights.budget ? "⚠️ You might exceed your budget. Consider adjusting spending habits." : "✅ You're on track with your budget!"}
      </p>

      {/* 📈 Spending Trends */}
      <h3>📈 Spending Over Time</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={insights.spendingTrends}>
            <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Spending (£)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#FF5733" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🧩 Spending Distribution */}
      <h3>🧩 Spending Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={insights.spendingDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
            {insights.spendingDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* 🔄 Recurring Expenses */}
      <h3>🔄 Recurring Transactions</h3>
      {insights.recurringTransactions?.length > 0 ? (
        insights.recurringTransactions.map((recurring, index) => (
          <p key={index}>🔄 {recurring.category} - £{recurring.amount} (Repeats Monthly)</p>
        ))
      ) : (
        <p>No recurring expenses detected.</p>
      )}

      {/* 📊 Category Breakdown */}
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

        {/* 🔍 Additional AI Advice */}
        <p>🔎 <strong>Spending Patterns:</strong> Your biggest expense is {insights.highestSpendingCategory}. Consider reducing discretionary spending.</p>
        <p>
          💰 <strong>Saving Opportunities:</strong> 
          {budget && !isNaN(budget.budget) && !isNaN(budget.spent) ? (
            budget.budget - budget.spent > 0 ? (
              <>You have £{(budget.budget - budget.spent).toFixed(2)} left in your budget. Consider allocating some of it to savings.</>
            ) : budget.budget - budget.spent === 0 ? (
              <>You have no remaining budget for this month.</>
            ) : (
              <>⚠️ You have overspent by £{Math.abs(budget.budget - budget.spent).toFixed(2)}. Consider adjusting your budget next month.</>
            )
          ) : (
            <>⚠️ Unable to fetch budget data. Check if your budget is set.</>
          )}
        </p>
        <p>📉 <strong>High-Risk Spending:</strong> Your spending in {insights.highestSpendingCategory} is above 50% of your total budget.</p>
        <p>🔄 <strong>Recurring Expenses:</strong> Detecting patterns can help optimize savings. Consider automating payments to manage cash flow.</p>
      </div>

      {/* 📂 Download Report */}
      <button onClick={downloadInsights} className="download-btn">📥 Download Report</button>
    </div>
  );
};

export default Insights;
