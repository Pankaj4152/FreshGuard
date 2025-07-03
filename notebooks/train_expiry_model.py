import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import make_pipeline

# Load data
df = pd.read_json(r"e:\\Projects\\FreshGuard\\data\\walmart inventory\\walmart_inventory_mock.json")

# Today's date for calculation
today = pd.to_datetime("2025-07-03")

# Feature engineering
df['expiry_date'] = pd.to_datetime(df['expiry_date'])
df['arrival_date'] = pd.to_datetime(df['arrival_date'])
df['days_to_expiry'] = (df['expiry_date'] - today).dt.days
df['days_in_stock'] = (today - df['arrival_date']).dt.days

# Select features and target
features = ['category', 'storage_type', 'current_temp_c', 'shelf_life_days', 'days_in_stock', 'current_stock']
X = df[features]
y = df['days_to_expiry']

# One-hot encode categorical features
X = pd.get_dummies(X, columns=['category', 'storage_type'])

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
print(f"Test R^2 Score: {score:.2f}")

# Save model if needed
import joblib
joblib.dump(model, "expiry_predictor_rf.joblib")

# Example: Predict days to expiry for a new product
sample = {
    "category": "Produce",
    "storage_type": "ambient",
    "current_temp_c": 10.0,
    "shelf_life_days": 14,
    "days_in_stock": 3,
    "current_stock": 50
}
sample_df = pd.DataFrame([sample])
sample_df = pd.get_dummies(sample_df, columns=['category', 'storage_type'])

# Align columns with training data
sample_df = sample_df.reindex(columns=X.columns, fill_value=0)

predicted_days = model.predict(sample_df)[0]
print(f"Predicted days to expiry for sample: {predicted_days:.1f}")