import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; 
import logo from '../../img/Logo_Text.png'; 

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      alert("Login successful!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username); // Ensure username is being set here
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    }

    setLoading(false);
};

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="SmartSpend Logo" />
      </div>
      <div className="login-box">
        <h2>Log in</h2>
        <p>Welcome back! Please enter your credentials.</p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        {error && <p className="login-message">{error}</p>}
        <p className="signup-prompt">
          Don't have an account? <Link to="/signup">Sign up here</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
