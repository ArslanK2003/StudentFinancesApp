const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget"); // ✅ Import Budget model (create this if not available)
const auth = require("../middleware/auth"); // ✅ Authentication middleware
const mongoose = require("mongoose");

// ✅ GET Budget Data
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Get user ID from JWT auth
    console.log("Fetching budget for user:", userId);

    const budget = await Budget.findOne({ user: userId });

    if (!budget) {
      return res.status(404).json({ message: "No budget data found." });
    }

    res.json({
      budget: budget.totalBudget,
      spent: budget.spent,
      categories: budget.categories,
      spendingTrends: budget.spendingTrends,
    });
  } catch (err) {
    console.error("❌ Error fetching budget data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
