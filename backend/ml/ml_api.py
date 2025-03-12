from flask import Flask, request, jsonify
import pickle
import pandas as pd
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS  # ✅ Import Flask-CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # ✅ Enable CORS for API endpoints

import os
# 🔥 Load the Trained Model with Absolute Path
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "spending_model.pkl")

with open(model_path, "rb") as model_file:
    model = pickle.load(model_file)

# 🏦 Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["studentFinancesApp"]
users_collection = db["users"]
budget_collection = db["budgets"]

def generate_feedback(predicted_spending, budget):
    """ Generate feedback based on predicted spending vs. budget. """
    feedback = []

    if predicted_spending > budget:
        feedback.append(f"⚠️ You're predicted to overspend by £{round(predicted_spending - budget, 2)}. Consider adjusting your spending habits.")
    
    elif predicted_spending > budget * 0.8:
        feedback.append(f"⚠️ You're close to exceeding your budget. Only £{round(budget - predicted_spending, 2)} left to spend.")

    else:
        feedback.append("✅ You're managing your spending well this month!")

    return feedback

# 📌 Prediction API
@app.route("/api/ml/predict", methods=["POST"])
def predict_spending():
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # 🔍 Fetch User Data from MongoDB
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    budget_data = budget_collection.find_one({"user": ObjectId(user_id)})
    budget = budget_data.get("budget", 0) if budget_data else 0  # Default budget to 0 if not found

    # 🎯 Prepare Input Data for the Model
    input_data = pd.DataFrame([{
        "age": user.get("age", 21),
        "monthly_income": user.get("monthly_income", 1000),
        "financial_aid": user.get("financial_aid", 0),
        "tuition": user.get("tuition", 500),
        "gender": user.get("gender", "Male"),
        "year_in_school": user.get("year_in_school", "Sophomore"),
        "major": user.get("major", "Computer Science"),
        "preferred_payment_method": user.get("preferred_payment_method", "Credit Card"),
    }])

    # 🚀 Predict Spending
    predicted_spending = model.predict(input_data)[0]
    predicted_spending = round(predicted_spending, 2)

    # 🔥 Generate Personalized Feedback
    feedback = generate_feedback(predicted_spending, budget)

    return jsonify({
        "predicted_spending": predicted_spending,
        "budget": budget,
        "feedback": feedback
    })

if __name__ == "__main__":
    app.run(port=5002, debug=True)
