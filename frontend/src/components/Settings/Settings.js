import React, { useState, useEffect } from "react";
import "./Settings.css";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const userId = localStorage.getItem("user_id");

  // Account settings
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState("GBP");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // ✅ Define fetchPreferences outside of useEffect so it's reusable
  const fetchPreferences = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/settings/preferences?user_id=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch preferences");
      const data = await response.json();
      
      // ✅ Set state with the fetched preferences
      setDarkMode(data.dark_mode);
      setCurrency(data.currency);
      setNotificationsEnabled(data.notifications);
    } catch (error) {
      console.error("❌ Error fetching preferences:", error);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [userId]); // ✅ Fetch settings every time `userId` changes

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);
  
  

  // ✅ Handle Username Change
  const handleChangeUsername = async () => {
    if (!newUsername) return alert("Please enter a new username.");
    
    try {
      const response = await fetch("http://localhost:5001/api/settings/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_username: newUsername }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("Username updated successfully!");
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // ✅ Handle Password Change
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return alert("Please fill in all fields.");

    try {
      const response = await fetch("http://localhost:5001/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("Password changed successfully!");
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsLoading(true);  // Start loading
    setMessage("");  // Clear previous messages
    try {
      const response = await fetch("http://localhost:5001/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, dark_mode: darkMode, currency, notifications: notificationsEnabled }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
  
      setMessage("✅ Preferences updated successfully!"); // Show success message
      fetchPreferences(); 
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);  // Stop loading
    }
  };
  
  // ✅ Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action is permanent.")) return;

    try {
      const response = await fetch(`http://localhost:5001/api/settings/delete?user_id=${userId}`, { method: "DELETE" });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.clear();
      navigate("/signup");
      alert("Account deleted successfully.");
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="settings-container">
      <h2>⚙️ <b>Settings</b></h2>

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={activeTab === "account" ? "active" : ""} 
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>

        <button 
          className={activeTab === "preferences" ? "active" : ""} 
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </button>

        <button 
          className={activeTab === "delete-account" ? "danger" : ""} 
          onClick={() => setActiveTab("delete-account")}
        >
          Delete Account
        </button>
      </div>

      {/* Account Settings */}
      {activeTab === "account" && (
        <div className="settings-section">
          <h3>🔑 <b>Account Settings</b></h3>

          <input
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleChangeUsername}>Change Username</button>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword}>Change Password</button>

          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>🔒 Logout</button>
        </div>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && (
        <div className="settings-section">
          <h3>🌟 <b>Preferences</b></h3>

          <div className="preferences-container">
            <div className="preference-item">
              <label htmlFor="dark-mode">Dark Mode</label>
              <input
                type="checkbox"
                id="dark-mode"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </div>

            <div className="preference-item">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="preference-item">
              <label htmlFor="notifications">Enable Notifications</label>
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </div>
          </div>

          {/* Save Preferences Button */}
          <button className="save-btn" onClick={handleUpdatePreferences} disabled={isLoading}>
              {isLoading ? "Saving..." : "💾 Save Preferences"}
            </button>
            <p>{message}</p> {/* Show success/error message */}
        </div>
      )}

      {/* Delete Account Section */}
      {activeTab === "delete-account" && (
        <div className="settings-section danger-zone">
          <h3>⚠️ <b>Delete Account</b></h3>
          <p>Deleting your account is <b>permanent</b> and cannot be undone. Please proceed with caution.</p>
          <button className="delete-btn" onClick={handleDeleteAccount}>🗑 Delete Account</button>
        </div>
      )}
    </div>
  );
};

export default Settings;
