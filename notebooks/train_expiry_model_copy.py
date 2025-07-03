import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load data
df = pd.read_json(r"e:\\Projects\\FreshGuard\\data\\walmart inventory\\walmart_inventory_mock.json")

# Feature engineering
# Remove rows with missing shelf_life_days
df = df.dropna(subset=['shelf_life_days'])

# Select features and target
features = ['category', 'storage_type', 'current_temp_c', 'current_stock', 'price_per_unit']
X = df[features]
y = df['shelf_life_days']

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

# Save model
joblib.dump(model, "shelf_life_predictor_rf.joblib")

# Example: Predict shelf life for a new product
sample = {
    "category": "Dairy",
    "storage_type": "refrigerated",
    "current_temp_c": 4.0,
    "current_stock": 10,
    "price_per_unit": 3.5
}
sample_df = pd.DataFrame([sample])
sample_df = pd.get_dummies(sample_df, columns=['category', 'storage_type'])
sample_df = sample_df.reindex(columns=X.columns, fill_value=0)

predicted_shelf_life = model.predict(sample_df)[0]
print(f"Predicted shelf life (days) for sample: {predicted_shelf_life:.1f}")

# To get expiry date for a new item:
arrival_date = pd.to_datetime("2025-07-03")
predicted_expiry = arrival_date + pd.Timedelta(days=predicted_shelf_life)
print(f"Predicted expiry date: {predicted_expiry.date()}")