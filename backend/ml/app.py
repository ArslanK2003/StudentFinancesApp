from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from ml_model import analyze_spending  # Import ML functions

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['studentFinancesApp']
budget_collection = db['budgets']

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

        return jsonify({
            "budget": budget_data.get("budget", 0),
            "spent": budget_data.get("spent", 0),
            "categories": budget_data.get("categories", []),
            "spendingTrends": budget_data.get("spendingTrends", [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/budget", methods=["POST"])
def save_budget():
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id_obj = ObjectId(user_id)
        budget_data = {
            "user": user_id_obj,
            "budget": data.get("budget", 0),
            "spent": data.get("spent", 0),
            "categories": data.get("categories", []),
            "spendingTrends": data.get("spendingTrends", [])
        }

        budget_collection.update_one({"user": user_id_obj}, {"$set": budget_data}, upsert=True)
        return jsonify({"message": "Budget saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ ML API Route
@app.route("/api/ml/insights", methods=["GET"])
def get_insights():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        insights = analyze_spending(user_id)
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
