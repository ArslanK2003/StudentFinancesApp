import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState(new Set());
  const [insights, setInsights] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id") || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30 Days");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "GBP");
  const navigate = useNavigate();
  const [predictedSpending, setPredictedSpending] = useState(null);

// ✅ Fetch User ID
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  const fetchUserId = async () => {
    if (!userId) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const userData = await response.json();
        localStorage.setItem("user_id", userData.id);
        setUserId(userData.id);
      } catch (error) {
        console.error("❌ Error fetching user ID:", error);
      }
    }
  };
  fetchUserId();
}, [navigate, userId]);

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
    } catch (error) {
      console.error("❌ Error fetching predictions:", error);
    }
  };

  fetchPredictions();
}, [userId]);

// ✅ Fetch Transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found. Redirecting to login.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.status === 401) {
          console.error("❌ Unauthorized! Token expired. Logging out...");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch transactions");

        const data = await response.json();
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
      } catch (error) {
        console.error("❌ Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, [navigate]);

  // ✅ Detect Recurring Transactions
  useEffect(() => {
    const checkRecurring = () => {
      const transactionMap = new Map();

      transactions.forEach((transaction) => {
        const key = `${transaction.category}-${transaction.amount}`;
        const transactionMonth = new Date(transaction.date).getMonth();
        
        if (!transactionMap.has(key)) {
          transactionMap.set(key, new Set());
        }
        transactionMap.get(key).add(transactionMonth);
      });

      const recurringSet = new Set();
      transactionMap.forEach((months, key) => {
        if (months.size > 1) {
          recurringSet.add(key);
        }
      });

      setRecurringTransactions(recurringSet);
    };

    checkRecurring();
  }, [transactions]);

  useEffect(() => {
    if (!userId) return;
    const fetchInsights = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/ml/insights?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch ML insights");
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error("❌ Error fetching ML insights:", error);
      }
    };
    fetchInsights();
  }, [userId]);  

  
// ✅ Apply Filters
useEffect(() => {
  let filtered = transactions;

  // Search Filter
  if (searchQuery.trim() !== "") {
    filtered = filtered.filter((transaction) =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Category Filter
  if (selectedCategory !== "All") {
    filtered = filtered.filter((transaction) => transaction.category === selectedCategory);
  }

  // Payment Method Filter
  if (selectedPayment !== "All") {
    filtered = filtered.filter((transaction) => transaction.paymentMethod === selectedPayment);
  }

  setFilteredTransactions(filtered);
}, [searchQuery, selectedCategory, selectedPayment, transactions]); 

// ✅ Export Transactions to CSV
const exportCSV = () => {
  const csvContent = [
    ["Date", "Amount", "Category", "Payment Method", "Description", "Status", "Recurring"], // CSV Headers
    ...filteredTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString("en-GB"),
      `£${transaction.amount.toFixed(2)}`,
      transaction.category,
      transaction.paymentMethod,
      transaction.description,
      transaction.status,
      recurringTransactions.has(`${transaction.category}-${transaction.amount}`) ? "Yes" : "No"
    ])
  ].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "transactions.csv");
};

// ✅ Export Transactions to PDF
const exportPDF = () => {
  const doc = new jsPDF();
  doc.text("Transaction Report", 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [["Date", "Amount", "Category", "Payment Method", "Description", "Status", "Recurring"]],
    body: filteredTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString("en-GB"),
      `£${transaction.amount.toFixed(2)}`,
      transaction.category,
      transaction.paymentMethod,
      transaction.description,
      transaction.status,
      recurringTransactions.has(`${transaction.category}-${transaction.amount}`) ? "Yes" : "No"
    ])
  });

  doc.save("transactions.pdf");
};

  // ✅ Handle Delete Transaction
  const deleteTransaction = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      // ✅ Remove transaction from state after successful deletion
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      console.error("❌ Error deleting transaction:", error);
    }
  };

// ✅ Handle Edit Transaction (Redirect to Edit Page)
const editTransaction = (transaction) => {
  navigate(`/edittransaction/${transaction._id}`, { state: transaction });
};

// ✅ Filter Transactions based on selected filters
useEffect(() => {
  let filtered = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

    if (selectedCategory !== "All") {
      filtered = filtered.filter((transaction) => transaction.category === selectedCategory);
    }
    if (selectedPayment !== "All") {
      filtered = filtered.filter((transaction) => transaction.paymentMethod === selectedPayment);
    }
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, selectedCategory, selectedPayment]);

  // ✅ Fetch AI Insights
  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/ml/insights?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch ML insights");
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error("❌ Error fetching ML insights:", error);
      }
    };

    fetchInsights();
  }, [userId]);

  // ✅ Apply Filters
  useEffect(() => {
    let filtered = transactions;

    // Search Filter (By Description)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category Filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((transaction) => transaction.category === selectedCategory);
    }

    // Payment Method Filter
    if (selectedPayment !== "All") {
      filtered = filtered.filter((transaction) => transaction.paymentMethod === selectedPayment);
    }

    // ✅ Update the state with filtered transactions
    setFilteredTransactions(filtered);
  }, [searchQuery, selectedCategory, selectedPayment, transactions]); // Runs when filters change


  // ✅ Prepare Data for Pie Chart
  const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(categoryTotals).map((category) => ({
    name: category,
    value: categoryTotals[category],
  }));

  // ✅ Prepare Data for Bar Chart
  const barChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
  }));

  console.log("Bar Chart Data:", barChartData); // Debugging
  
// ✅ Define colors for Pie Chart
const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#ff4d4d"];
  
// Update currency when it changes in localStorage
useEffect(() => {
  const handleStorageChange = () => {
    const newCurrency = localStorage.getItem("currency") || "GBP";
    console.log("Currency updated to:", newCurrency); // Debugging log
    setCurrency(newCurrency);
  };

  window.addEventListener("storage", handleStorageChange);
  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);

// Format transaction amount based on currency
const formatAmount = (amount) => {
  switch (currency) {
    case "USD":
      return `$${amount.toFixed(2)}`;
    case "EUR":
      return `€${amount.toFixed(2)}`;
    default:
      return `£${amount.toFixed(2)}`;
  }
};

return (
  <div className="transaction-container">
    <h2>Transaction History</h2>
    <Link to="/addtransaction" className="add-transaction-btn">+ Add Transaction</Link>

    {/* ✅ Export Buttons */}
    <div className="export-buttons">
      <button onClick={exportCSV} className="csv-export-btn">📄 Export as CSV</button>
      <button onClick={exportPDF} className="pdf-export-btn">📑 Export as PDF</button>
    </div>
    
{/* ✅ Filters Section */}
<div className="filters">
        <input type="text" placeholder="Search description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>

        <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)}>
          <option value="All">All Payment Methods</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
        </select>

        {/* ✅ Reset Filters Button */}
        <button onClick={() => {
          setSearchQuery("");
          setSelectedCategory("All");
          setSelectedPayment("All");
        }}>
          Reset Filters
        </button>
      </div>
      <h2>📂 Transactions</h2>
        
{/* ✅ Transactions Table */}
<table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount ({currency})</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Description</th>
            <th>Status</th>
            <th>Recurring</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <tr key={transaction._id} className={recurringTransactions.has(`${transaction.category}-${transaction.amount}`) ? "recurring-transaction" : ""}>
                <td>{new Date(transaction.date).toLocaleDateString("en-GB")}</td>
                <td>{formatAmount(transaction.amount)}</td>
                <td>{transaction.category}</td>
                <td>{transaction.paymentMethod}</td>
                <td>{transaction.description}</td>
                <td>{transaction.status}</td>
                <td>{recurringTransactions.has(`${transaction.category}-${transaction.amount}`) ? "✅ Recurring" : "❌"}</td>
                <td>
                  <button onClick={() => editTransaction(transaction)}>✏️ Edit</button>
                  <button onClick={() => deleteTransaction(transaction._id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    
{/* ✅ Monthly Spending Bar Chart */}
{barChartData.length > 0 && (
        <div className="chart-container">
          <h3>📉 Monthly Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {insights && (
        <div className="insights-container">
          <h3>📊 AI-Powered Insights</h3>
          <p>🔮 Estimated Monthly Spending: £{insights.predicted_spending}</p>
          <p>📅 {insights.predicted_explanation}</p>
          {insights.feedback && insights.feedback.length > 0 && (
            <ul>
              {insights.feedback.map((msg, index) => (
                <li key={index}>⚠️ {msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
