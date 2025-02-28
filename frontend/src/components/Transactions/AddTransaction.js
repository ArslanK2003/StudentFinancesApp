import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTransaction.css';

const AddTransaction = () => {
  const [transaction, setTransaction] = useState({
    date: '',
    amount: '',
    category: 'Food',
    paymentMethod: 'Card',
    description: '',
    status: 'Completed',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert("❌ No token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      console.log("🔹 Submitting transaction...");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transaction),
      });

      if (response.status === 401) {
        console.error("🔹 Token expired. Logging out...");
        localStorage.removeItem("token");
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      alert("✅ Transaction added successfully!");
      navigate('/transactions');  // ✅ Redirect after adding transaction
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      alert(error.message || 'Failed to add transaction!');
    }
  };

  return (
    <div className="add-transaction-container">
      <h2>Add New Transaction</h2>
      <form className="add-transaction-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={transaction.date}
          onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={transaction.amount}
          onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
          required
        />
        <select
          value={transaction.category}
          onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
        >
          <option value="Food">Food</option>
          <option value="Rent">Rent</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Travel">Travel</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
        <select
          value={transaction.paymentMethod}
          onChange={(e) => setTransaction({ ...transaction, paymentMethod: e.target.value })}
        >
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={transaction.description}
          onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
          required
        />
        <select
          value={transaction.status}
          onChange={(e) => setTransaction({ ...transaction, status: e.target.value })}
        >
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;
