import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
import os
import pickle

# 📂 Load the dataset (Update the path if needed)
base_dir = os.path.dirname(os.path.abspath(__file__))  # Get current script directory
file_path = os.path.join(base_dir, "student_spending.csv")  # Join with CSV filename

df = pd.read_csv(file_path)

# 🎯 Define Target Variable (Total Spending)
df["total_spending"] = df[
    ["housing", "food", "transportation", "books_supplies",
     "entertainment", "personal_care", "technology",
     "health_wellness", "miscellaneous"]
].sum(axis=1)

# 🎯 Drop Unnecessary Columns
df.drop(["housing", "food", "transportation", "books_supplies",
         "entertainment", "personal_care", "technology",
         "health_wellness", "miscellaneous"], axis=1, inplace=True)

# 🔧 Separate Features (X) & Target (y)
X = df.drop(["total_spending"], axis=1)
y = df["total_spending"]

# 📊 Identify Categorical & Numerical Columns
categorical_cols = ["gender", "year_in_school", "major", "preferred_payment_method"]
numerical_cols = ["age", "monthly_income", "financial_aid", "tuition"]

# 🛠 Preprocessing Pipeline (One-Hot Encoding + Scaling)
preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numerical_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
])

# 🚀 Train the Model (Random Forest Regressor)
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor(n_estimators=100, random_state=42))
])

# 📚 Split Data for Training & Testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 🎯 Train the Model
pipeline.fit(X_train, y_train)

# Get the absolute path dynamically
base_dir = os.path.dirname(os.path.abspath(__file__))  # Get current script directory
model_path = os.path.join(base_dir, "spending_model.pkl")  # Save the model here

# Ensure the directory exists before saving
os.makedirs(os.path.dirname(model_path), exist_ok=True)

# Save the model
with open(model_path, "wb") as model_file:
    pickle.dump(pipeline, model_file) 


print(f"✅ Model training completed! Saved at {model_path}")
