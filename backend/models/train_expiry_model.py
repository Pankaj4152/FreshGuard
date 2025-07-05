"""
Train Shelf Life Prediction Model
---------------------------------
Trains a regression model to predict shelf life (in days) using inventory data.
Saves the model, encoders, and columns for later inference.
"""

import pandas as pd
import numpy as np
import joblib
import os

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

def train_model(data_path, model_path="./backend/models/shelf_life_model.joblib"):
    # Load data
    df = pd.read_json(data_path)
    # If the data is a list of dicts, not wrapped in "inventory"
    if "inventory" in df:
        df = pd.DataFrame(df["inventory"].tolist())

    # Features and target (remove 'sales_per_day' if not present in your data)
    features = [
        "item_name", "category", "storage_type",
        "current_temp_c", "humidity", "price_per_unit"
    ]
    # Optionally add "sales_per_day" if your data includes it
    if "sales_per_day" in df.columns:
        features.append("sales_per_day")
    target = "shelf_life_days"

    # Drop rows with missing values
    df = df.dropna(subset=features + [target])

    # Encode categorical features
    encoders = {}
    for col in ["item_name", "category", "storage_type"]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le

    X = df[features]
    y = df[target]

    # Train/test split (optional)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Save model, encoders, and columns
    joblib.dump(model, model_path)
    joblib.dump(encoders, model_path.replace(".joblib", "_encoders.joblib"))
    joblib.dump(features, model_path.replace(".joblib", "_columns.joblib"))

    print(f"Model trained and saved to {model_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train shelf life prediction model.")
    parser.add_argument("--data", type=str, default="./data/walmart_inventory_training.json", help="Path to training data JSON")
    parser.add_argument("--model", type=str, default="./shelf_life_model.joblib", help="Path to save model")
    args = parser.parse_args()
    train_model(args.data, args.model)