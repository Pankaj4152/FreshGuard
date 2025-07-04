# FreshGuard Shelf Life Prediction Model

This module trains a machine learning model to predict the **shelf life (in days)** of food inventory items based on product and storage features.  
It is designed for hackathon/demo use with randomly generated data, but is modular and ready for real data integration.

---

## Features

- **Model:** RandomForestRegressor (robust for small/noisy datasets)
- **Categorical Encoding:** LabelEncoder for `category` and `storage_type`
- **Feature Set:**  
  - `category` (e.g., Dairy, Produce)
  - `storage_type` (e.g., refrigerated, ambient)
  - `current_temp_c` (current storage temperature)
  - `humidity` (storage humidity)
  - `current_stock` (units in stock)
  - `price_per_unit`
  - `sales_per_day`
- **Saves:**  
  - Trained model (`.joblib`)
  - Label encoders for categorical features
  - Feature column order

---

## How It Works

### 1. **Data Loading**
- Reads inventory data from a JSON file (default: `walmart_inventory.json`).
- Drops rows missing any required feature or target (`shelf_life_days`).

### 2. **Feature Preparation**
- Selects relevant features.
- Encodes categorical columns (`category`, `storage_type`) using `LabelEncoder`.
- Returns feature matrix `X`, target vector `y`, and encoders.

### 3. **Model Training**
- Splits data into training and test sets (80/20).
- Trains a `RandomForestRegressor` on the data.
- Prints test R² score for quick evaluation.

### 4. **Saving Artifacts**
- Saves the trained model, encoders, and feature columns for later use in prediction or deployment.

---

## Usage

### **Train the Model**

Run the script in your terminal:
```
python train_shelf_life_model.py
```
You will be prompted for:
- The path to your inventory JSON file (press Enter for default)
- The path to save the model (press Enter for default)

Example:
```
Enter path to inventory JSON file [walmart_inventory.json]: 
Enter path to save model [shelf_life_predictor_rf.joblib]: 
```

### **Artifacts Created**
- `shelf_life_predictor_rf.joblib` — The trained model
- `shelf_life_predictor_rf_encoders.joblib` — Label encoders for categorical features
- `shelf_life_predictor_rf_columns.joblib` — List of feature columns (for correct prediction input order)

---

## Example Prediction Code

To use the model for prediction in another script:

```python
import pandas as pd
import joblib

# Load model, encoders, and columns
model = joblib.load("shelf_life_predictor_rf.joblib")
encoders = joblib.load("shelf_life_predictor_rf_encoders.joblib")
columns = joblib.load("shelf_life_predictor_rf_columns.joblib")

# Example new item
sample = {
    "category": "Dairy",
    "storage_type": "refrigerated",
    "current_temp_c": 4.0,
    "humidity": 0.85,
    "current_stock": 20,
    "price_per_unit": 3.99,
    "sales_per_day": 15
}
sample_df = pd.DataFrame([sample])

# Encode categorical features
for col in ['category', 'storage_type']:
    if sample_df[col][0] in encoders[col].classes_:
        sample_df[col] = encoders[col].transform([sample_df[col][0]])[0]
    else:
        sample_df[col] = 0  # Default for unseen categories

# Align columns
sample_df = sample_df.reindex(columns=columns, fill_value=0)

# Predict shelf life
predicted_shelf_life = int(model.predict(sample_df)[0])
print(f"Predicted shelf life (days): {predicted_shelf_life}")
```

---

## Notes

- **Data:** The model is currently trained on randomly generated data. For production, retrain with real inventory and shelf life data.
- **Extensibility:** You can add or remove features in `prepare_features()` as your data evolves.
- **Deployment:** The saved model and encoders can be loaded in any Python environment for batch or real-time predictions.

---

## File Structure

```
e:\Projects\FreshGuard\
│
├── train_shelf_life_model.py
├── walmart_inventory.json
├── shelf_life_predictor_rf.joblib
├── shelf_life_predictor_rf_encoders.joblib
├── shelf_life_predictor_rf_columns.joblib
└── README_shelf_life_model.md
```

---

## Contact

For questions or improvements, please contact the FreshGuard hackathon