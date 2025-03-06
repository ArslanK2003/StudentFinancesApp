import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Import Link
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Insights.css";

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/insights?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch insights data");
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error("❌ Error fetching insights:", error);
      }
    };

    fetchInsights();
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

    doc.text("AI Recommendations:", 20, 90);
    insights.recommendations.forEach((rec, index) => {
      doc.text(`• ${rec}`, 20, 100 + index * 10);
    });

    doc.save("Financial_Insights.pdf");
  };

  return (
    <div className="insights-container">
      <h2>📊 Insights</h2>
      
      {/* Spending Insights */}
      <div className="insight-cards">
        <p><strong>Highest Spending Category:</strong> {insights.highestSpendingCategory}</p>
        <p><strong>Lowest Spending Category:</strong> {insights.lowestSpendingCategory}</p>
        <p><strong>Daily Average Spending:</strong> £{insights.dailyAverageSpending}</p>
        <p><strong>Largest Transaction:</strong> £{insights.largestTransaction.amount} ({insights.largestTransaction.date})</p>
      </div>

      {/* Spending Over Time Graph */}
      <h3>📈 Spending Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={insights.spendingTrends}>
          <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Spending (£)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#FF5733" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      {/* Spending Distribution Pie Chart */}
      <h3>🧩 Spending Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={insights.spendingDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {insights.spendingDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>💡 AI-Generated Insights</h3>
      <div className="insights-advice">
        {insights.recommendations.length > 0 ? (
          insights.recommendations.map((insight, index) => (
            <p key={index}>🔹 <strong>{insight.split(":")[0]}</strong>: {insight.split(":")[1]}</p>
          ))
        ) : (
          <p>No AI insights available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Insights;
