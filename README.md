# 💰 Smart Budgeting Web App

A full-stack budgeting and financial insights application built to help students track their income, manage expenses, and gain spending insights through machine learning predictions.

---

## 🚀 Live Preview

> Coming soon — Localhost-based development setup currently in use.

---

## 🧰 Tech Stack

### 🌐 Frontend
- **React.js**
- React Router DOM
- CSS Modules
- Chart libraries (e.g., Chart.js or Recharts)

### 🧠 Backend
- **Flask** (Python)
- JWT Authentication
- CORS Handling
- SQLite3 (for development)

### 📊 Machine Learning
- **Random Forest Regressor**
- Trained using sample transaction data
- Stored as `.pkl` and loaded via Flask to return real-time predictions

---

## 🔐 Features

### ✅ Authentication
- JWT-based login and signup
- Token stored securely in `localStorage`
- Routes protected on both frontend and backend

### 💳 Transactions
- Add, view, and (soon) edit/delete transactions
- Tracks:
  - Date
  - Amount
  - Category
  - Payment Method
  - Description
  - Status

### 📈 Budgeting
- Set monthly income and category allocations
- View remaining budget and total spent

### 🔮 Insights
- Predict next month's spending with ML
- Visual insights using frontend charts

### 🎯 Goals
- Add savings goals (e.g., for travel, tuition)
- View goal progress over time

### ⚙️ Settings (in progress)
- Logout
- Toggle dark mode (coming)
- Change currency (coming)
- Reset budget or delete account (planned)

---

## 🛠️ Installation & Setup

### 🔁 Prerequisites
- Node.js & npm
- Python 3.9+
- SQLite3

### 📁 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-budgeting-app.git
cd smart-budgeting-app
