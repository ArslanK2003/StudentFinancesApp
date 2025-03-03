import React, { useState } from "react";
import "./Settings.css";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  // State for account settings
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // State for preferences
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState("GBP");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
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
          <button>Change Username</button>

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
          <button>Change Password</button>

          {/* Logout Button Moved Here */}
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
        </div>
      )}

      {/* Delete Account Section */}
      {activeTab === "delete-account" && (
        <div className="settings-section danger-zone">
          <h3>⚠️ <b>Delete Account</b></h3>
          <p>
            Deleting your account is <b>permanent</b> and cannot be undone. Please proceed with caution.
          </p>
          <button className="delete-btn">🗑 Delete Account</button>
        </div>
      )}
    </div>
  );
};

export default Settings;
