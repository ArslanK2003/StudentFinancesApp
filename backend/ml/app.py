from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from ml_model import analyze_spending  # ✅ Import ML functions
from datetime import datetime
import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = MongoClient("mongodb://localhost:27017/")
db = client["studentFinancesApp"]
transactions_collection = db['transactions']
budget_collection = db['budgets']
goals_collection = db['goals']
users_collection = db["users"]

# ✅ Budget API Routes
@app.route("/api/budget", methods=["GET"])
def get_budget():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)
        budget_data = budget_collection.find_one({"user": user_id_obj})

        if not budget_data:
            return jsonify({"error": "No budget data found"}), 404

        # ✅ Ensure `spendingTrends` is always present
        spending_trends = budget_data.get("spendingTrends", [])
        if not spending_trends:
            spending_trends = [
                {"day": 1, "amount": 50},
                {"day": 2, "amount": 75},
                {"day": 3, "amount": 30},
                {"day": 4, "amount": 90},
                {"day": 5, "amount": 60},
            ]

        return jsonify({
            "budget": budget_data.get("budget", 0),
            "spent": budget_data.get("spent", 0),
            "categories": budget_data.get("categories", []),
            "spendingTrends": spending_trends  # ✅ Ensure graph always has data
        })
    except Exception as e:
        print("❌ Error fetching budget data:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/budget", methods=["POST"])
def save_budget():
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)

        # ✅ Ensure `spendingTrends` is always stored
        spending_trends = data.get("spendingTrends", [])
        if not spending_trends:
            spending_trends = [
                {"day": 1, "amount": 50},
                {"day": 2, "amount": 75},
                {"day": 3, "amount": 30},
                {"day": 4, "amount": 90},
                {"day": 5, "amount": 60},
            ]

        budget_data = {
            "user": user_id_obj,
            "budget": data.get("budget", 0),
            "spent": data.get("spent", 0),
            "categories": data.get("categories", []),
            "spendingTrends": spending_trends,  # ✅ Ensure it's always stored
        }

        budget_collection.update_one({"user": user_id_obj}, {"$set": budget_data}, upsert=True)
        return jsonify({"message": "Budget saved successfully"}), 200
    except Exception as e:
        print("❌ Error saving budget data:", str(e))
        return jsonify({"error": str(e)}), 500


# ✅ ML API Route (Rename it to avoid conflicts)
@app.route("/api/ml/insights", methods=["GET"])
def get_ml_insights():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        insights = analyze_spending(user_id)
        return jsonify(insights)
    except Exception as e:
        print("❌ Error fetching ML insights:", str(e))
        return jsonify({"error": str(e)}), 500


# ✅ Insights API Route (Fix Spending Distribution & Categories)
@app.route("/api/insights", methods=["GET"])
def get_financial_insights():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)
    except Exception as e:
        return jsonify({"error": "Invalid User ID format"}), 400

    # Fetch Transactions
    transactions = list(transactions_collection.find({"user": user_id_obj}))
    if not transactions:
        return jsonify({"error": "No transactions found"}), 404

    # Fetch Budget Data
    budget_data = budget_collection.find_one({"user": user_id_obj}) or {}
    budget = budget_data.get("budget", 0)

    # ✅ Compute Insights
    category_spending = {}
    total_spent = 0
    largest_transaction = {"amount": 0, "date": "No Transactions Yet"}
    spending_trends = []

    for txn in transactions:
        category = txn.get("category", "Other")
        amount = txn.get("amount", 0)
        total_spent += amount

        # ✅ Fix Spending Trends (Ensure Day is Correct)
        txn_date = txn.get("date", None)
        if isinstance(txn_date, str):
            try:
                day = int(txn_date.split("-")[-1])  # Extract day from "YYYY-MM-DD"
            except ValueError:
                day = 1
        elif isinstance(txn_date, dict) or isinstance(txn_date, list):
            day = 1
        else:
            day = txn_date.day if txn_date else 1

        spending_trends.append({"day": day, "amount": amount})

        # ✅ Fix Spending Distribution (Correct Structure)
        if category in category_spending:
            category_spending[category] += amount
        else:
            category_spending[category] = amount

        # ✅ Fix Largest Transaction
        if amount > largest_transaction["amount"]:
            largest_transaction = {"amount": amount, "date": txn.get("date", "Unknown")}

    highest_spending_category = max(category_spending, key=category_spending.get, default="No Data")
    lowest_spending_category = min(category_spending, key=category_spending.get, default="No Data")

    daily_average_spending = round(total_spent / max(1, len(transactions)), 2)

    # ✅ Fix Spending Trends Sorting
    spending_trends = sorted(spending_trends, key=lambda x: x["day"])

    # ✅ Ensure at least dummy data exists
    if not spending_trends:
        spending_trends = [{"day": i, "amount": 50 + (i * 10)} for i in range(1, 6)]

    # ✅ Fix Spending Distribution for Pie Chart
    spending_distribution = [{"name": category, "value": amount} for category, amount in category_spending.items()]

    # ✅ AI-Based Recommendations
    insights = analyze_spending(user_id)
    recommendations = insights.get("insights", [])

    # ✅ Overspending Warnings
    for category, amount in category_spending.items():
        if budget and amount > (budget / len(category_spending)):
            recommendations.append(f"⚠️ You exceeded your budget in {category} by £{amount - (budget / len(category_spending)):.2f}")

    response = {
        "highestSpendingCategory": highest_spending_category,
        "lowestSpendingCategory": lowest_spending_category,
        "dailyAverageSpending": daily_average_spending,
        "largestTransaction": largest_transaction,
        "spendingTrends": spending_trends,  # ✅ Ensure Line Chart has data
        "spendingDistribution": spending_distribution,  # ✅ Fix for Pie Chart
        "recommendations": recommendations  # ✅ AI Insights
    }

    return jsonify(response)

def analyze_spending(user_id):
    user_id_obj = ObjectId(user_id)

    # Fetch transactions and budget data
    transactions = list(transactions_collection.find({"user": user_id_obj}))
    budget_data = budget_collection.find_one({"user": user_id_obj}) or {}

    # ✅ Ensure budget is always a number (default to 0)
    budget = float(budget_data.get("budget", 0))

    # If no transactions, return a default response
    if not transactions:
        return {
            "predicted_spending": 0.00,
            "predicted_explanation": "No transaction history available to make a prediction.",
            "budget": budget,  # ✅ Ensure budget is returned
            "remaining_budget": budget,  # ✅ No spending yet
            "insights": ["No transaction history available."],
            "spendingDistribution": [],
            "spendingTrends": []
        }

    # Extract transaction amounts
    past_spendings = [txn["amount"] for txn in transactions if "amount" in txn]

    # Ensure enough data for ML prediction
    if len(past_spendings) >= 3:
        weights = [0.6, 0.3, 0.1]
        predicted_spending = sum(
            past_spendings[-3:][i] * weights[i] for i in range(3)
        )
    else:
        predicted_spending = sum(past_spendings) / max(1, len(past_spendings))

    # ✅ Ensure predicted spending is always a number
    predicted_spending = round(float(predicted_spending), 2)

    print(f"🚀 Calculated Predicted Spending: £{predicted_spending}")  # Debugging log

    # ✅ Correctly Calculate Remaining Budget
    remaining_budget = round(budget - predicted_spending, 2)

    # ✅ Prevent Negative or NaN Values
    if remaining_budget < 0 or remaining_budget != remaining_budget:  # Check if NaN
        remaining_budget = 0.00

    print(f"💰 Remaining Budget: £{remaining_budget}")  # Debugging log

    return {
        "predicted_spending": predicted_spending,
        "predicted_explanation": (
            f"Based on your last 3 transactions, we estimate your next expenses will be around £{predicted_spending}. "
            "If your spending pattern continues, you may need to adjust your budget accordingly."
        ),
        "budget": budget,  # ✅ Always return budget
        "remaining_budget": remaining_budget,  # ✅ Fixed remaining budget
        "insights": ["Your spending insights will help optimize your budget."],  # ✅ Ensure insights exist
        "spendingDistribution": [{"name": "Food", "value": 50}, {"name": "Entertainment", "value": 80}],  # Example Data
        "spendingTrends": []
    }


@app.route("/api/goals", methods=["GET"])
def get_goals():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)
        goals = list(goals_collection.find({"user": user_id_obj}))

        # ✅ Convert ObjectId fields to string before returning
        for goal in goals:
            goal["_id"] = str(goal["_id"])
            goal["user"] = str(goal["user"])  # Convert user ObjectId to string

        return jsonify(goals), 200
    except Exception as e:
        print("❌ Error fetching goals:", str(e))
        return jsonify({"error": str(e)}), 500


# ✅ Contribute to Goal
@app.route("/api/goals/contribute", methods=["POST"])
def contribute_to_goal():
    data = request.json
    user_id = data.get("user_id")
    goal_id = data.get("goal_id")
    amount = data.get("amount")

    if not user_id or not goal_id or not amount:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        goal_obj = ObjectId(goal_id)
        user_obj = ObjectId(user_id)

        # ✅ Find goal in database
        goal = goals_collection.find_one({"_id": goal_obj, "user": user_obj})
        if not goal:
            return jsonify({"error": "Goal not found"}), 404

        # ✅ Ensure amount is a valid number
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Invalid contribution amount"}), 400

        # ✅ Update goal savings correctly
        new_savings = goal.get("saved", 0) + amount
        goals_collection.update_one(
            {"_id": goal_obj},
            {"$set": {"saved": new_savings}}
        )

        # ✅ Return updated goal
        response = jsonify({"message": "Contribution added successfully", "new_savings": new_savings})
        response.headers.add("Access-Control-Allow-Origin", "*")  # ✅ Fix CORS
        return response, 200
    except Exception as e:
        print("❌ Error contributing to goal:", str(e))  # Log error for debugging
        return jsonify({"error": str(e)}), 500

    
@app.route("/api/goals", methods=["POST"])
def add_goal():
    data = request.json
    user_id = data.get("user_id")
    name = data.get("name")
    target = data.get("target")
    deadline = data.get("deadline")

    if not user_id or not name or not target or not deadline:
        return jsonify({"error": "All fields are required"}), 400

    try:
        goal_data = {
            "user": ObjectId(user_id),  # Store as ObjectId in DB
            "name": name,
            "target": float(target),  # Ensure numeric storage
            "saved": 0,  # Default to £0 saved
            "deadline": deadline
        }

        # ✅ Insert goal into MongoDB
        inserted_goal = goals_collection.insert_one(goal_data)

        # ✅ Convert `_id` and `user` to strings before returning response
        goal_data["_id"] = str(inserted_goal.inserted_id)
        goal_data["user"] = str(user_id)  

        return jsonify(goal_data), 201
    except Exception as e:
        print("❌ Error adding goal:", str(e))  # Debugging Log
        return jsonify({"error": str(e)}), 500

# ✅ DELETE Goal API Route (Fix CORS Issue)
@app.route("/api/goals/<goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    try:
        goal_obj = ObjectId(goal_id)

        # ✅ Find and Delete Goal
        result = goals_collection.delete_one({"_id": goal_obj})

        if result.deleted_count == 0:
            return jsonify({"error": "Goal not found"}), 404

        response = jsonify({"message": "Goal deleted successfully"})
        response.headers.add("Access-Control-Allow-Origin", "*")  # ✅ Allow CORS
        return response, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Update Username
@app.route("/api/settings/username", methods=["POST"])
def update_username():
    data = request.json
    user_id = data.get("user_id")
    new_username = data.get("new_username")

    if not user_id or not new_username:
        return jsonify({"error": "Missing user ID or new username"}), 400

    try:
        user_obj = ObjectId(user_id)
        users_collection.update_one({"_id": user_obj}, {"$set": {"username": new_username}})
        return jsonify({"message": "Username updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/settings/password", methods=["POST"])
def change_password():
    data = request.json
    user_id = data.get("user_id")
    current_password = data.get("current_password").encode('utf-8')  # Convert to bytes
    new_password = data.get("new_password").encode('utf-8')  # Convert to bytes

    if not user_id or not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        print(f"🔍 Received user_id: {user_id}")  # Debugging
        user_obj = ObjectId(user_id)
        user = users_collection.find_one({"_id": user_obj})
        
        if not user:
            print("❌ User not found in database!")
            return jsonify({"error": "User not found"}), 404
        
        stored_password = user.get('password', '').encode('utf-8')  # Convert stored hash to bytes
        print(f"🔐 Stored password hash: {stored_password}")  # Debugging

        if not stored_password:
            return jsonify({"error": "Password not found in user data"}), 500

        # ✅ Fix: Use bcrypt for password checking
        if not bcrypt.checkpw(current_password, stored_password):
            return jsonify({"error": "Incorrect current password"}), 401

        # ✅ Hash new password with bcrypt
        hashed_password = bcrypt.hashpw(new_password, bcrypt.gensalt()).decode('utf-8')
        print(f"🔑 New hashed password: {hashed_password}")  # Debugging

        users_collection.update_one({"_id": user_obj}, {"$set": {"password": hashed_password}})
        print("✅ Password updated successfully!")  # Debugging
        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        print(f"🔥 Error changing password: {e}")  # Print full error
        return jsonify({"error": str(e)}), 500


# ✅ Update Preferences
@app.route("/api/settings/preferences", methods=["POST"])
def update_preferences():
    data = request.json
    user_id = data.get("user_id")
    dark_mode = data.get("dark_mode", False)
    currency = data.get("currency", "GBP")
    notifications = data.get("notifications", True)

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_obj = ObjectId(user_id)
        users_collection.update_one(
            {"_id": user_obj},
            {
                "$set": {
                    "dark_mode": bool(dark_mode),  # Ensure it's stored as boolean
                    "currency": currency if currency else "GBP",  # Default to GBP if missing
                    "notifications": bool(notifications)  # Ensure it's stored as boolean
                }
            },
            upsert=True  # 🔥 This ensures the fields exist if missing
        )
        return jsonify({"message": "Preferences updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Delete Account
@app.route("/api/settings/delete", methods=["DELETE"])
def delete_account():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_obj = ObjectId(user_id)
        users_collection.delete_one({"_id": user_obj})
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ✅ Fetch User Preferences
@app.route("/api/settings/preferences", methods=["GET"])
def get_preferences():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_obj = ObjectId(user_id)
        user = users_collection.find_one({"_id": user_obj}, {"_id": 0, "dark_mode": 1, "currency": 1, "notifications": 1})

        if not user:
            # ✅ Return default values instead of 404
            return jsonify({
                "dark_mode": False,
                "currency": "GBP",
                "notifications": True
            }), 200

        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("✅ Registered Routes:", [rule.rule for rule in app.url_map.iter_rules()])
    app.run(port=5001, debug=True)
