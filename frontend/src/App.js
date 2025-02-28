import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import Transactions from "./components/Transactions/Transactions";
import AddTransaction from "./components/Transactions/AddTransaction";
import Navbar from "./components/Navbar"; // Import the new Navbar

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
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
