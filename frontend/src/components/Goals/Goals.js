import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import "./Goals.css";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", saved: "", deadline: "" });
  const [contributionAmounts, setContributionAmounts] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  // ✅ Split active & achieved goals
  const activeGoals = goals.filter(goal => goal.saved < goal.target);
  const achievedGoals = goals.filter(goal => goal.saved >= goal.target);


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

  const handleInputChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert("Please fill all fields!");
      return;
    }
  
    const goalData = { 
      name: newGoal.name, 
      target: newGoal.target, 
      deadline: newGoal.deadline, 
      user_id: userId,
      saved: 0, // Start at 0
    };
  
    try {
      const response = await fetch("http://localhost:5001/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
  
      if (!response.ok) throw new Error("Failed to add goal");
  
      const newGoalFromServer = await response.json();
      setGoals([...goals, newGoalFromServer]);
      setNewGoal({ name: "", target: "", saved: "", deadline: "" });
    } catch (error) {
      console.error("❌ Error adding goal:", error);
    }
  };

  // ✅ Handle Input Change for Contribution Amount
  const handleContributionChange = (goalId, amount) => {
    setContributionAmounts({
      ...contributionAmounts,
      [goalId]: amount
    });
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
      const response = await fetch("http://localhost:5001/api/goals/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          goal_id: goalId,
          amount: amount,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to contribute to goal");
  
      const data = await response.json();

      // ✅ Update UI Immediately
      setGoals(goals.map(goal =>
        goal._id === goalId ? { ...goal, saved: data.new_savings } : goal
      ));
  
      // ✅ Reset Input Field
      setContributionAmounts({ ...contributionAmounts, [goalId]: "" });

      // 🎉 Show Confetti If Goal is Achieved
      if (data.new_savings >= targetAmount) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
  
    } catch (error) {
      console.error("❌ Error contributing to goal:", error);
    }
  };

    // ✅ **Delete Goal Function**
    const deleteGoal = async (goalId) => {
      if (!window.confirm("Are you sure you want to delete this goal?")) return;
  
      try {
        const response = await fetch(`http://localhost:5001/api/goals/${goalId}`, {
          method: "DELETE",
        });
  
        if (!response.ok) throw new Error("Failed to delete goal");
  
        setGoals(goals.filter(goal => goal._id !== goalId)); // ✅ Remove from UI
      } catch (error) {
        console.error("❌ Error deleting goal:", error);
      }
    };

    return (
      <div className="goals-container">
        {showConfetti && <Confetti numberOfPieces={200} />}
  
        <h2>🎯 Your Goals</h2>
  
        {/* ✅ Active Goals */}
        {activeGoals.length > 0 ? (
          activeGoals.map((goal) => (
            <div key={goal._id} className="goal-card">
              <h3>🏆 {goal.name}</h3>
              <p><strong>Target:</strong> £{goal.target}</p>
              <p><strong>Current Savings:</strong> £{goal.saved}</p>
  
              {/* ✅ Progress Bar */}
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${(goal.saved / goal.target) * 100}%` }}
                ></div>
              </div>
  
              {/* ✅ Show "Achieved" Label When Goal is Complete */}
              {goal.saved >= goal.target ? (
                <p className="goal-achieved">🎉 Goal Achieved!</p>
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Enter amount (£)"
                    value={contributionAmounts[goal._id] || ""}
                    onChange={(e) => handleContributionChange(goal._id, e.target.value)}
                  />
                  <button onClick={() => contributeToGoal(goal._id, goal.target, goal.saved)}>
                    💰 Contribute
                  </button>
                </>
              )}
  
              {/* ✅ Delete Button */}
              <button className="delete-goal-btn" onClick={() => deleteGoal(goal._id)}>
                ❌ Delete Goal
              </button>
            </div>
          ))
        ) : (
          <p>No active goals. Start saving today!</p>
        )}
  
        {/* ✅ Add New Goal */}
        <div className="add-goal">
          <h3>➕ Add New Goal</h3>
          <input type="text" name="name" placeholder="Goal Name" value={newGoal.name} onChange={handleInputChange} required />
          <input type="number" name="target" placeholder="Target Amount (£)" value={newGoal.target} onChange={handleInputChange} required />
          <input type="date" name="deadline" value={newGoal.deadline} onChange={handleInputChange} required />
          <button className="add-goal-btn" onClick={addGoal}>➕ Add Goal</button>
        </div>
  
        {/* ✅ Achieved Goals */}
        {achievedGoals.length > 0 && (
          <div className="achieved-goals">
            <h2>🏆 Achieved Goals</h2>
            {achievedGoals.map((goal) => (
              <div className="achieved-goal-card" key={goal._id}>
                <h3>🎉 {goal.name} (Achieved)</h3>
                <p>Target: £{goal.target}</p>
                <p>Saved: £{goal.saved}</p>
              </div>
            ))}
          </div>
        )}
  
        {/* ✅ Achievements Section */}
        <div className="achievements">
          <h3>🏅 Achievements</h3>
          <p>You've saved £{goals.reduce((acc, goal) => acc + parseFloat(goal.saved), 0)} toward your goals!</p>
        </div>
      </div>
    );
  };
  
  export default Goals;