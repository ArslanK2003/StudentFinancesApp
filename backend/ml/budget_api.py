from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['studentFinancesApp']
budget_collection = db['budgets']

@app.route("/api/budget", methods=["GET"])
def get_budget():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        print(f"🔹 Received user_id: {user_id}")  # ✅ Debugging

        try:
            user_id_obj = ObjectId(user_id)  # ✅ Convert to ObjectId
        except Exception as e:
            print(f"❌ Invalid ObjectId format: {e}")
            return jsonify({"error": "Invalid user ID format"}), 400
        
        budget_data = budget_collection.find_one({"user": user_id_obj})
        
        if not budget_data:
            print(f"❌ No budget data found for user {user_id_obj}")
            return jsonify({"error": "No budget data found"}), 404

        print(f"✅ Found budget data: {budget_data}")  # ✅ Debugging

        response = {
            "budget": budget_data.get("budget", 0),
            "spent": budget_data.get("spent", 0),
            "categories": budget_data.get("categories", []),
            "spendingTrends": budget_data.get("spendingTrends", [])
        }
        return jsonify(response)
    
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
        user_id = ObjectId(user_id)
        budget_data = {
            "user": user_id,
            "budget": data.get("budget", 0),
            "spent": data.get("spent", 0),
            "categories": data.get("categories", []),
            "spendingTrends": data.get("spendingTrends", [])
        }

        budget_collection.update_one({"user": user_id}, {"$set": budget_data}, upsert=True)
        return jsonify({"message": "Budget saved successfully"}), 200
    except Exception as e:
        print("❌ Error saving budget data:", str(e))
        return jsonify({"error": str(e)}), 500

# ✅ Ensure Flask registers the route
if __name__ == "__main__":
    print("✅ Registered Routes:", [rule.rule for rule in app.url_map.iter_rules()])
    app.run(host="0.0.0.0", port=5001, debug=True)
