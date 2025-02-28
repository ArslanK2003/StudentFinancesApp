const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            console.error("❌ No Authorization header received.");
            return res.status(401).json({ message: "No authorization header provided." });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log("🔹 Token received:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user) {
            console.error("❌ No user found with this token.");
            return res.status(401).json({ message: "Invalid authentication." });
        }

        req.user = user;
        next();
    } catch (e) {
        console.error("❌ Error in authentication:", e.message);
        res.status(401).json({ message: "Please authenticate." });
    }
};

module.exports = auth;
