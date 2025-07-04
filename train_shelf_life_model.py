import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

def load_data(json_path):
    """
    Load inventory data from a JSON file and drop rows with missing required fields.
    Args:
        json_path (str): Path to the inventory JSON file.
    Returns:
        pd.DataFrame: Cleaned DataFrame.
    """
    df = pd.read_json(json_path)
    # Remove rows missing any required feature or target
    df = df.dropna(subset=['shelf_life_days', 'category', 'storage_type', 'current_temp_c', 'humidity'])
    return df

def prepare_features(df):
    """
    Prepare features and encode categorical columns for model training.
    Args:
        df (pd.DataFrame): Inventory DataFrame.
    Returns:
        X (pd.DataFrame): Feature matrix.
        y (pd.Series): Target vector (shelf_life_days).
        label_encoders (dict): Fitted LabelEncoders for categorical columns.
    """
    features = ['item_name', 'category', 'storage_type', 'current_temp_c', 'humidity', 'price_per_unit', 'sales_per_day']
    X = df[features].copy()
    y = df['shelf_life_days']
    label_encoders = {}
    # Encode categorical features
    for col in ['item_name', 'category', 'storage_type']:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
    return X, y, label_encoders

def train_and_save_model(X, y, label_encoders, model_path="shelf_life_predictor_rf.joblib"):
    """
    Train a RandomForestRegressor and save the model, encoders, and feature columns.
    Args:
        X (pd.DataFrame): Feature matrix.
        y (pd.Series): Target vector.
        label_encoders (dict): Fitted LabelEncoders.
        model_path (str): Path to save the trained model.
    """
    # Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    # Train the model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    # Evaluate model performance
    score = model.score(X_test, y_test)
    print(f"Test R^2 Score: {score:.2f}")
    # Save model, encoders, and feature columns for later use
    joblib.dump(model, model_path)
    joblib.dump(label_encoders, model_path.replace(".joblib", "_encoders.joblib"))
    joblib.dump(X.columns.tolist(), model_path.replace(".joblib", "_columns.joblib"))
    print(f"Model and encoders saved to {model_path}")

def main():
    """
    CLI for training the shelf life prediction model.
    """
    json_path = input("Enter path to inventory JSON file [walmart_inventory.json]: ") or "walmart_inventory.json"
    model_path = input("Enter path to save model [shelf_life_predictor_rf.joblib]: ") or "shelf_life_predictor_rf.joblib"
    df = load_data(json_path)
    X, y, label_encoders = prepare_features(df)
    train_and_save_model(X, y, label_encoders, model_path)

if __name__ == "__main__":
    main()