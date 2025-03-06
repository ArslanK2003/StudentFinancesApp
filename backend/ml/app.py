from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from ml_model import analyze_spending  # ✅ Import ML functions
from datetime import datetime

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['studentFinancesApp']
transactions_collection = db['transactions']
budget_collection = db['budgets']
goals_collection = db['goals']

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

    # Fetch transactions & budget data
    transactions = list(transactions_collection.find({"user": user_id_obj}))
    budget_data = budget_collection.find_one({"user": user_id_obj}) or {}

    budget = budget_data.get("budget", 0)
    categories = budget_data.get("categories", [])
    total_spent = sum(txn.get("amount", 0) for txn in transactions)
    remaining_budget = budget - total_spent

    # Determine highest & lowest spending categories
    category_spending = {category["name"]: category["spent"] for category in categories}
    highest_spending_category = max(category_spending, key=category_spending.get, default="N/A")
    lowest_spending_category = min(category_spending, key=category_spending.get, default="N/A")

    # ✅ Fix: Ensure percentage is always <= 100%
    highest_spent_amount = category_spending.get(highest_spending_category, 0)
    highest_spent_percentage = min((highest_spent_amount / max(1, total_spent)) * 100, 100)  # 🔹 Fix Here

    # Generate AI Insights
    insights = []

    # 1️⃣ Alert if a category exceeds budget
    for category in categories:
        if category["spent"] > category["allocated"]:
            overspend = category["spent"] - category["allocated"]
            insights.append(f"Your spending on {category['name']} exceeded your budget by £{overspend}. Consider setting a stricter limit.")

    # 2️⃣ Suggest saving based on remaining budget
    if remaining_budget > 0:
        suggested_savings = round(remaining_budget * 0.35)  # Suggest 35% savings
        insights.append(f"You have £{remaining_budget} remaining for this month. Consider allocating £{suggested_savings} to Savings.")

    # 3️⃣ Highlight highest spending category if it's over 50% of total spending
    if highest_spent_percentage > 50:
        insights.append(f"Your {highest_spending_category} accounts for {int(highest_spent_percentage)}% of your total spending. Consider reducing discretionary expenses.")

    return {
        "insights": insights,
        "spendingTrends": budget_data.get("spendingTrends", []),
        "spendingDistribution": category_spending,
    }

# ✅ Fetch User Goals
@app.route("/api/goals", methods=["GET"])
def get_goals():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)
        goals = list(goals_collection.find({"user": user_id_obj}))
        
        # ✅ Convert ObjectId to string
        for goal in goals:
            goal["_id"] = str(goal["_id"])

        return jsonify(goals)
    except Exception as e:
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

        # ✅ Find goal in database
        goal = goals_collection.find_one({"_id": goal_obj, "user": ObjectId(user_id)})
        if not goal:
            return jsonify({"error": "Goal not found"}), 404

        # ✅ Update goal savings
        new_savings = goal["currentSavings"] + amount
        goals_collection.update_one(
            {"_id": goal_obj},
            {"$set": {"currentSavings": new_savings}}
        )

        return jsonify({"message": "Contribution added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    print("✅ Registered Routes:", [rule.rule for rule in app.url_map.iter_rules()])
    app.run(port=5001, debug=True)
