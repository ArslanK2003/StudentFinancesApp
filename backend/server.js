const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Model and Middleware imports
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const budgetRoutes = require("./routes/budget");
app.use("/api/budget", budgetRoutes); // ✅ Add Budget API Route

mongoose.connect('mongodb://localhost/studentFinancesApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected...'))
.catch(err => console.log(err));

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// ✅ Create a dedicated transaction routes file instead of handling it in server.js
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

// Serve React build files in production
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

app.get('/api/transactions', auth, async (req, res) => {
  try {
      console.log("Fetching transactions for user:", req.user.id); // 🔹 Log user ID
      const transactions = await Transaction.find({ user: req.user.id });
      console.log("Fetched transactions:", transactions); // 🔹 Log fetched transactions
      res.json({ transactions });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
  }
});