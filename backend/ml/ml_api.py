from flask import Flask, jsonify, request
from flask_cors import CORS
from ml_model import analyze_spending  # ✅ Ensure this function is correctly imported

app = Flask(__name__)
CORS(app)

@app.route("/api/ml/insights", methods=["GET"])
def get_insights():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        insights = analyze_spending(user_id)
        print("✅ Insights generated:", insights)  # ✅ Debugging
        return jsonify(insights)
    except Exception as e:
        print("❌ Error in ML API:", str(e))
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

print("✅ Registered Routes:", [rule.rule for rule in app.url_map.iter_rules()])  # 🔹 Debugging

if __name__ == "__main__":
    app.run(port=5001, debug=True)
