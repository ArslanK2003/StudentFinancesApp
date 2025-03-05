import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SetBudget.css";

const SetBudget = () => {
  const [budget, setBudget] = useState(0);
  const [categories, setCategories] = useState([]);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  // ✅ Fetch existing budget details
  useEffect(() => {
    if (!userId) return;

    const fetchBudgetData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/budget?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch budget data");

        const data = await response.json();
        setBudget(data.budget);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("❌ Error fetching budget data:", error);
      }
    };

    fetchBudgetData();
  }, [userId]);

  // ✅ Handle Budget Input Change
  const handleBudgetChange = (e) => {
    setBudget(parseFloat(e.target.value) || 0);
  };

  // ✅ Handle Category Updates
  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index][field] = parseFloat(value) || 0;

    // Auto-update remaining budget
    if (field === "allocated" || field === "spent") {
      updatedCategories[index]["remaining"] = updatedCategories[index]["allocated"] - updatedCategories[index]["spent"];
    }

    setCategories(updatedCategories);
  };

  // ✅ Add New Category
  const addCategory = () => {
    setCategories([...categories, { name: "", allocated: 0, spent: 0, remaining: 0 }]);
  };

  // ✅ Remove Category
  const removeCategory = (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
  };

  // ✅ Handle Budget Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedCategories = categories.map((category) => ({
      ...category,
      remaining: category.allocated - category.spent,
    }));

    const budgetData = {
      user_id: userId,
      budget: budget,
      categories: updatedCategories,
      spent: updatedCategories.reduce((acc, category) => acc + category.spent, 0),
    };

    try {
      const response = await fetch("http://localhost:5001/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) throw new Error("Failed to save budget data");

      navigate("/budget"); // ✅ Redirect to Budget page
    } catch (error) {
      console.error("❌ Error saving budget:", error);
    }
  };

  return (
    <div className="set-budget-container">
      <h2>💰 Set Your Monthly Budget</h2>

      <form onSubmit={handleSubmit} className="budget-form">
        {/* ✅ Total Budget Input */}
        <label htmlFor="budget">Total Budget (£):</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={handleBudgetChange}
          min="0"
          required
        />

        {/* ✅ Budget Categories */}
        <h3>📊 Budget Categories</h3>
        {categories.map((category, index) => (
          <div key={index} className="category-row">
            <input
              type="text"
              placeholder="Category Name"
              value={category.name}
              onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Allocated (£)"
              value={category.allocated}
              onChange={(e) => handleCategoryChange(index, "allocated", e.target.value)}
              min="0"
              required
            />
            <input
              type="number"
              placeholder="Spent (£)"
              value={category.spent}
              onChange={(e) => handleCategoryChange(index, "spent", e.target.value)}
              min="0"
              required
            />
            <button type="button" className="remove-btn" onClick={() => removeCategory(index)}>❌</button>
          </div>
        ))}

        {/* ✅ Add New Category Button */}
        <button type="button" className="add-category-btn" onClick={addCategory}>
          ➕ Add Category
        </button>

        {/* ✅ Save Budget Button */}
        <button type="submit" className="save-budget-btn">💾 Save Budget</button>
      </form>
    </div>
  );
};

export default SetBudget;
