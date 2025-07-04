import pandas as pd
import joblib

def predict_shelf_life(sample, model_path="shelf_life_predictor_rf.joblib"):
    """
    Predict the shelf life (in days) for a given product sample.

    Args:
        sample (dict): Dictionary with product features.
        model_path (str): Path to the trained model file.

    Returns:
        int: Predicted shelf life in days.
    """
    # Load model, encoders, and feature columns
    model = joblib.load(model_path)
    encoders = joblib.load(model_path.replace(".joblib", "_encoders.joblib"))
    columns = joblib.load(model_path.replace(".joblib", "_columns.joblib"))
    sample_df = pd.DataFrame([sample])
    # Encode categorical features using saved encoders
    for col in ['item_name', 'category', 'storage_type']:
        if col in sample_df and sample_df[col][0] in encoders[col].classes_:
            sample_df[col] = encoders[col].transform([sample_df[col][0]])[0]
        else:
            sample_df[col] = 0  # Default for unseen categories or missing
    # Align columns to match training data
    sample_df = sample_df.reindex(columns=columns, fill_value=0)
    predicted_shelf_life = int(model.predict(sample_df)[0])
    return predicted_shelf_life

def main():
    """
    CLI for testing shelf life prediction on a user-provided sample.
    """
    model_path = input("Enter path to trained model [shelf_life_predictor_rf.joblib]: ") or "shelf_life_predictor_rf.joblib"
    print("Enter sample details for prediction:")
    sample = {
        "item_name": input("Sample item_name (e.g. Milk): ") or "Milk",
        "category": input("Sample category (e.g. Dairy): ") or "Dairy",
        "storage_type": input("Sample storage_type (e.g. refrigerated): ") or "refrigerated",
        "current_temp_c": float(input("Sample current_temp_c (e.g. 4.0): ") or 4.0),
        "humidity": float(input("Sample humidity (e.g. 0.85): ") or 0.85),
        "price_per_unit": float(input("Sample price_per_unit (e.g. 3.99): ") or 3.99),
        "sales_per_day": int(input("Sample sales_per_day (e.g. 15): ") or 15)
    }
    predicted = predict_shelf_life(sample, model_path)
    print(f"\nPredicted shelf life (days) for sample: {predicted}")

if __name__ == "__main__":
    main()