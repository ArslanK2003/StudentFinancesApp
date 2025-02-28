const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// ✅ Get all transactions for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        res.json(transactions);
    } catch (err) {
        console.error("❌ Error fetching transactions:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Add a new transaction
router.post('/', auth, async (req, res) => {
    const { date, amount, category, paymentMethod, description, status } = req.body;

    try {
        const newTransaction = new Transaction({
            date,
            amount,
            category,
            paymentMethod,
            description,
            status,
            user: req.user.id
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (err) {
        console.error("❌ Error saving transaction:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
