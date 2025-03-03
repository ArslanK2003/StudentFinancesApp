const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  categories: [
    {
      name: String,
      allocated: Number,
      spent: Number,
      remaining: Number,
      icon: String,
    },
  ],
  spendingTrends: [
    {
      day: Number,
      amount: Number,
    },
  ],
});

module.exports = mongoose.model("Budget", BudgetSchema);
