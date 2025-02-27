const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/studentFinancesApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body

// Static files for production
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Routes
const userRoutes = require('./routes/user'); // Ensure the path matches the location of your user.js file
app.use('/api/users', userRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
