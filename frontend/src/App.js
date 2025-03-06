import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import Transactions from "./components/Transactions/Transactions";
import AddTransaction from "./components/Transactions/AddTransaction";
import EditTransaction from "./components/Transactions/EditTransaction";
import Budget from "./components/Budget/Budget"; // ✅ Import Budget Page
import SetBudget from "./components/Budget/SetBudget"; // ✅ Import Set Budget Page
import Navbar from "./components/Navbar"; // Import the new Navbar
import Settings from "./components/Settings/Settings"; // Import Settings
import Insights from "./components/Insights/Insights";
import Goals from "./components/Goals/Goals"
import "./index.css"; // Ensure global styles are applied

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Navbar handleLogout={handleLogout} />
            <Routes>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/addtransaction" element={<AddTransaction />} />
                <Route path="/edittransaction/:id" element={<EditTransaction />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/budget" element={<Budget />} /> {/* ✅ Ensure this exists */}
                <Route path="/setbudget" element={<SetBudget />} /> {/* ✅ Added Set Budget Page */}
                <Route path="/insights" element={<Insights />} />
                <Route path="/goals" element={<Goals />} />
            </Routes>
        </Router>
    );
}

export default App;
