# 💰 SmartSpend – Intelligent Budgeting for Students

A full-stack budgeting and financial insights application built to help students track their income, manage expenses, and gain spending insights through machine learning predictions.

---

## 🚀 Live Preview

> ⚠️ Currently not deployed. You can run it locally by following the steps below.

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
- Add, view, and edit/delete transactions
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
- AI-powered predictions of future spending using trained ML models
- Generates feedback if you may overspend
- Visual summaries via charts (Bar, Line, Pie)

### 🎯 Goals
- Add savings goals (e.g., for travel, tuition)
- View goal progress over time

### ⚙️ Settings (in progress)
- Logout
- Toggle dark mode
- Change currency
- Reset budget or delete account

---

## 🛠️ Installation & Setup

### 🔁 Prerequisites
- Node.js & npm
- Python 3.9+
- SQLite3
- MongoDB (via MongoDB Atlas or localhost)
- RESTful Flask APIs
- CORS with Flask-CORS

### 📁 1. Clone the Repository

```bash
git clone https://github.com/ArslanK2003/StudentFinancesApp.git
cd smart-budgeting-app
```

### ▶️ 2. Backend Setup (Flask)
> 🧠 Note: The ML API and main backend run separately on different ports (`5001`, `5002`)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate on Mac/Linux

pip install -r requirements.txt
python app.py  # Starts backend on http://127.0.0.1:5001

```

### 🌐 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm start  # Starts frontend on http://localhost:3000
```

### 4. 🧠 Train the ML Model (optional)
```bash
cd backend/ml
python train_model.py  # generates spending_model.pkl
```

### 5. Start Flask ML API
```bash
cd backend/ml
python ml_api.py
# Runs at http://localhost:5002
```
