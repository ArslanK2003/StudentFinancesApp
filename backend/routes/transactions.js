const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// ✅ GET all transactions for the logged-in user
router.get("/", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json({ transactions });
    } catch (err) {
        console.error("❌ Error fetching transactions:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ POST a new transaction
router.post("/", auth, async (req, res) => {
    const { date, amount, category, paymentMethod, description, status } = req.body;
    try {
        const newTransaction = new Transaction({
            date,
            amount,
            category,
            paymentMethod,
            description,
            status,
            user: req.user.id,
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (err) {
        console.error("❌ Error adding transaction:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ UPDATE an existing transaction
router.put("/:id", auth, async (req, res) => {
    const { date, amount, category, paymentMethod, description, status } = req.body;

    try {
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { date, amount, category, paymentMethod, description, status },
            { new: true } // ✅ Returns updated document
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json(updatedTransaction);
    } catch (err) {
        console.error("❌ Error updating transaction:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ DELETE a transaction
router.delete("/:id", auth, async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!deletedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting transaction:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
