"""
FreshGuard 2.0 - Shelf Life Prediction Model
------------------------------------------------
This script trains a DecisionTreeRegressor on synthetic food shelf life data.
It provides a function to predict shelf life (in days) given an item and storage type.
The trained model is saved as 'shelf_life_model.joblib'.

How to modify:
- To add new features (e.g., category), update the feature extraction logic.
- To retrain, run this script after updating 'food_data.csv'.
"""

import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Path to data and model
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'food_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'shelf_life_model.joblib')

# Load data
food_df = pd.read_csv(DATA_PATH, comment='#')

# Encode categorical features
item_encoder = LabelEncoder()
storage_encoder = LabelEncoder()

food_df['item_enc'] = item_encoder.fit_transform(food_df['item'])
food_df['storage_enc'] = storage_encoder.fit_transform(food_df['storage'])

# Features: item, storage (can add 'category' if desired)
X = food_df[['item_enc', 'storage_enc']]
y = food_df['shelf_life_days']

# Train model
model = DecisionTreeRegressor(random_state=42)
model.fit(X, y)

# Save model and encoders
joblib.dump({
    'model': model,
    'item_encoder': item_encoder,
    'storage_encoder': storage_encoder
}, MODEL_PATH)


def predict_shelf_life(item: str, storage: str) -> int:
    """
    Predict shelf life (in days) for a given item and storage type.
    Args:
        item (str): Name of the food item (e.g., 'milk')
        storage (str): Storage type (e.g., 'refrigerated', 'room_temp')
    Returns:
        int: Predicted shelf life in days (rounded to nearest int)
    """
    # Load model and encoders
    bundle = joblib.load(MODEL_PATH)
    model = bundle['model']
    item_encoder = bundle['item_encoder']
    storage_encoder = bundle['storage_encoder']

    # Handle unseen items/storage gracefully
    try:
        item_enc = item_encoder.transform([item])[0]
    except ValueError:
        # If item not seen during training, use most common item
        item_enc = item_encoder.transform([item_encoder.classes_[0]])[0]
    try:
        storage_enc = storage_encoder.transform([storage])[0]
    except ValueError:
        storage_enc = storage_encoder.transform([storage_encoder.classes_[0]])[0]

    X_pred = [[item_enc, storage_enc]]
    pred = model.predict(X_pred)[0]
    return int(round(pred))


if __name__ == "__main__":
    # Example usage and test
    print("Retraining model and testing prediction...")
    test_item = "milk"
    test_storage = "refrigerated"
    days = predict_shelf_life(test_item, test_storage)
    print(f"Predicted shelf life for {test_item} ({test_storage}): {days} days") 