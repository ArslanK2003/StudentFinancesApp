import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Goals.css";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", saved: "", deadline: "" });
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/goals?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch goals");
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("❌ Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, [userId]);

  const handleContributionChange = (goalId, amount) => {
    setContributionAmounts({
      ...contributionAmounts,
      [goalId]: amount
    });
  };

  // ✅ Handle input change for new goal
  const handleInputChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  // ✅ Add a new goal
  const addGoal = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert("Please fill all fields!");
      return;
    }

    const goalData = { ...newGoal, user_id: userId, saved: 0 }; // Start at 0 saved

    try {
      const response = await fetch("http://localhost:5001/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) throw new Error("Failed to add goal");

      setGoals([...goals, goalData]);
      setNewGoal({ name: "", target: "", saved: "", deadline: "" }); // Reset input fields
    } catch (error) {
      console.error("❌ Error adding goal:", error);
    }
  };

  // ✅ Handle Contribution Submission
  const contributeToGoal = async (goalId, targetAmount, currentSavings) => {
    const amount = parseFloat(contributionAmounts[goalId]) || 0;

    if (amount <= 0) {
      alert("Please enter a valid contribution amount.");
      return;
    }
    
    if (currentSavings + amount > targetAmount) {
      alert("Contribution exceeds the goal target!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/goals/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          goal_id: goalId,
          amount: amount
        }),
      });

      if (!response.ok) throw new Error("Failed to contribute to goal");
      
      // ✅ Update UI Immediately
      setGoals(goals.map(goal => 
        goal._id === goalId ? { ...goal, currentSavings: goal.currentSavings + amount } : goal
      ));
      
      // ✅ Reset Input Field
      setContributionAmounts({ ...contributionAmounts, [goalId]: "" });

    } catch (error) {
      console.error("❌ Error contributing to goal:", error);
    }
  };

  return (
    <div className="goals-container">
      <h2>🎯 Your Goals</h2>

      {goals.map((goal) => (
        <div key={goal._id} className="goal-card">
          <h3>🏆 {goal.name}</h3>
          <p><strong>Target:</strong> £{goal.targetAmount}</p>
          <p><strong>Current Savings:</strong> £{goal.currentSavings}</p>

          {/* ✅ Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(goal.currentSavings / goal.targetAmount) * 100}%` }}
            ></div>
          </div>

          {/* ✅ Contribution Input Field */}
          <input
            type="number"
            placeholder="Enter amount (£)"
            value={contributionAmounts[goal._id] || ""}
            onChange={(e) => handleContributionChange(goal._id, e.target.value)}
          />
          <button onClick={() => contributeToGoal(goal._id, goal.targetAmount, goal.currentSavings)}>
            💰 Contribute
          </button>
        </div>
      ))}
    
      {/* ✅ Add New Goal Section */}
      <div className="add-goal">
        <h3>Add New Goal</h3>
        <input type="text" name="name" placeholder="Goal Name" value={newGoal.name} onChange={handleInputChange} required />
        <input type="number" name="target" placeholder="Target Amount (£)" value={newGoal.target} onChange={handleInputChange} required />
        <input type="date" name="deadline" value={newGoal.deadline} onChange={handleInputChange} required />
        <button className="add-goal-btn" onClick={addGoal}>➕ Add Goal</button>
      </div>

      {/* ✅ Achievements Section */}
      <div className="achievements">
        <h3>🏅 Achievements</h3>
        <p>You've saved £{goals.reduce((acc, goal) => acc + parseFloat(goal.saved), 0)} toward your goals!</p>
        <p>Keep up the great work!</p>
      </div>

      {/* ✅ Milestones Section */}
      <div className="milestones">
        <h3>🎯 Milestones</h3>
        <p>Track your goal progress over time!</p>
      </div>
    </div>
  );
};

export default Goals;
