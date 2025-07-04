"""
Shelf Life Prediction Module
---------------------------
Predicts shelf life (in days) for a product sample using a trained ML model.
Can be used as a CLI or imported as a module for API deployment.
"""

import pandas as pd
import joblib
import os

def predict_shelf_life(sample, model_path=None):
    """
    Predict the shelf life (in days) for a given product sample.
    Args:
        sample (dict): Product features.
        model_path (str): Path to trained model (default: from env or fallback).
    Returns:
        int: Predicted shelf life in days, or None if error.
    """
    if model_path is None:
        model_path = os.environ.get("SHELF_LIFE_MODEL_PATH", "./backend/models/shelf_life_model.joblib")
    try:
        model = joblib.load(model_path)
        encoders = joblib.load(model_path.replace(".joblib", "_encoders.joblib"))
        columns = joblib.load(model_path.replace(".joblib", "_columns.joblib"))
    except Exception as e:
        print(f"Error loading model or encoders: {e}")
        return None

    sample_df = pd.DataFrame([sample])
    for col in ['item_name', 'category', 'storage_type']:
        if col in sample_df and sample_df[col][0] in encoders[col].classes_:
            sample_df[col] = encoders[col].transform([sample_df[col][0]])[0]
        else:
            sample_df[col] = 0
    sample_df = sample_df.reindex(columns=columns, fill_value=0)
    return int(model.predict(sample_df)[0])

def main():
    """
    CLI for local testing.
    """
    print("Shelf Life Prediction CLI")
    model_path = input("Enter path to trained model [./backend/models/shelf_life_model.joblib]: ") or "./backend/models/shelf_life_model.joblib"
    try:
        sample = {
            "item_name": input("Sample item_name (e.g. Milk): ") or "Milk",
            "category": input("Sample category (e.g. Dairy): ") or "Dairy",
            "storage_type": input("Sample storage_type (e.g. refrigerated): ") or "refrigerated",
            "current_temp_c": float(input("Sample current_temp_c (e.g. 4.0): ") or 4.0),
            "humidity": float(input("Sample humidity (e.g. 0.85): ") or 0.85),
            "price_per_unit": float(input("Sample price_per_unit (e.g. 3.99): ") or 3.99),
            "sales_per_day": int(input("Sample sales_per_day (e.g. 15): ") or 15)
        }
    except Exception as e:
        print(f"Invalid input: {e}")
        return

    predicted = predict_shelf_life(sample, model_path)
    if predicted is not None:
        print(f"\nPredicted shelf life (days) for sample: {predicted}")

if __name__ == "__main__":
    main()