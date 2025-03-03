import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from pymongo import MongoClient
from bson import ObjectId  # ✅ Needed for handling MongoDB ObjectId

def fetch_transactions(user_id):
    """Fetch user transactions from MongoDB."""
    client = MongoClient('mongodb://localhost:27017/')
    db = client['studentFinancesApp']
    transactions = db['transactions']
    
    # Convert user_id to ObjectId if needed
    try:
        user_id = ObjectId(user_id)
    except:
        pass  

    data = list(transactions.find({'user': user_id}, {'_id': 0, 'date': 1, 'amount': 1, 'category': 1}))

    print(f"🔹 Fetched Transactions for user {user_id}: {data}")  # Debugging

    df = pd.DataFrame(data)

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df.sort_values(by='date', inplace=True)

    return df

def predict_next_month_spending(df):
    """Predict next month's spending using Linear Regression."""
    if df.empty:
        return 0  # ✅ Directly return a numeric value if no data

    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year  # ✅ Include year to handle multiple years

    # ✅ Aggregate spending by month and year
    monthly_spending = df.groupby(['year', 'month'])['amount'].sum().reset_index()

    # ✅ Convert 'year' and 'month' into a single numerical feature for better predictions
    monthly_spending['time_index'] = (
        (monthly_spending['year'] - monthly_spending['year'].min()) * 12
    ) + monthly_spending['month']

    X = monthly_spending[['time_index']]  # ✅ Use 'time_index' as a feature
    y = monthly_spending['amount']

    # ✅ Use Simple Moving Average if not enough data for Linear Regression
    if len(X) < 2:
        return int(y.mean()) if len(y) > 0 else 0  # ✅ Return mean if not enough data

    model = LinearRegression()
    model.fit(X, y)

    next_time_index = X['time_index'].max() + 1  # ✅ Predict for next month
    next_month = pd.DataFrame({"time_index": [next_time_index]})  # ✅ Ensure correct format

    print("🔹 Next Month Input:", next_month)  # ✅ Debugging

    prediction = model.predict(next_month)[0]

    # ✅ If prediction is unexpectedly low, use a simple average
    if prediction < y.mean():
        print("⚠️ Using moving average instead of regression")
        prediction = y.mean()

    return max(int(prediction), 0)  # ✅ Ensure spending is never negative


def get_budget_insights(df):
    """Generate insights based on spending categories."""
    if df.empty:
        return {"insights": [], "message": "No transactions found."}
    
    category_spending = df.groupby('category')['amount'].sum().reset_index()
    category_spending.sort_values(by='amount', ascending=False, inplace=True)
    
    insights = []
    for _, row in category_spending.iterrows():
        insights.append(f"You spent £{int(row['amount'])} on {row['category']} this month.")  # ✅ Convert to int

    return {"insights": insights, "message": "Generated spending insights."}

def analyze_spending(user_id):
    """Main function to get spending predictions and insights."""
    df = fetch_transactions(user_id)
    prediction = predict_next_month_spending(df)
    insights = get_budget_insights(df)
    
    return {
        "prediction": prediction,  # ✅ Now returns a single integer
        "insights": insights["insights"],  # ✅ Fix nested structure
        "message": insights["message"]
    }
