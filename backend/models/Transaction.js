const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["Food", "Rent", "Entertainment", "Travel", "Miscellaneous"],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["Card", "Cash"],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Completed", "Pending"],
        required: true
    }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
