import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions(); // Fetch transactions on page load
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Unauthorized! Redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 401) {
        console.error("🔹 Token expired. Logging out...");
        localStorage.removeItem("token");  // ✅ Clear expired token
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data || []); // ✅ Fix: Ensure transactions array is updated
    } catch (error) {
      console.error('❌ Error fetching transactions:', error.message);
    }
  };

  return (
    <div className="transaction-container">
      <h2>Transactions</h2>
      <Link to="/addtransaction" className="add-transaction-btn">+ Add Transaction</Link>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount (£)</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>£{transaction.amount}</td>
              <td>{transaction.category}</td>
              <td>{transaction.paymentMethod}</td>
              <td>{transaction.description}</td>
              <td className={transaction.status === 'Completed' ? 'status-completed' : 'status-pending'}>
                {transaction.status}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
