import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./EditTransaction.css";

const EditTransaction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionData = location.state;

  // ✅ Convert date to "yyyy-MM-dd" format for input compatibility
  const formatDate = (isoDate) => {
    return isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";
  };

  const [transaction, setTransaction] = useState({
    date: formatDate(transactionData?.date),
    amount: transactionData?.amount || "",
    category: transactionData?.category || "Food",
    paymentMethod: transactionData?.paymentMethod || "Card",
    description: transactionData?.description || "",
    status: transactionData?.status || "Completed",
  });

  useEffect(() => {
    if (!transactionData) {
      alert("❌ No transaction data found!");
      navigate("/transactions");
    }
  }, [transactionData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ No token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      console.log("🔹 Updating transaction...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/transactions/${transactionData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(transaction),
        }
      );

      if (response.status === 401) {
        console.error("🔹 Token expired. Logging out...");
        localStorage.removeItem("token");
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      alert("✅ Transaction updated successfully!");
      navigate("/transactions");
    } catch (error) {
      console.error("❌ Error updating transaction:", error);
      alert(error.message || "Failed to update transaction!");
    }
  };

  return (
    <div className="edit-transaction-container">
      <h2>Edit Transaction</h2>
      <form className="edit-transaction-form" onSubmit={handleSubmit}>
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
        <button type="submit">Update Transaction</button>
        <button type="button" className="cancel-btn" onClick={() => navigate("/transactions")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditTransaction;
