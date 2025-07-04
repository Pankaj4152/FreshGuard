"""
FreshGuard 2.0 - Flask API
--------------------------
Provides endpoints for inventory tracking, shelf life prediction, alerts, discounts, loyalty points, and dashboard metrics.
Integrates with Firebase Firestore, ML model, and mock Walmart inventory.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import joblib
from datetime import datetime, timedelta
import json

# --- Config ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'shelf_life_model.joblib')
MOCK_API_PATH = os.path.join(BASE_DIR, 'mock_api', 'walmart_inventory.json')
FIREBASE_CRED_PATH = os.path.join(BASE_DIR, 'firebase_credentials.json')

# --- Initialize Flask ---
app = Flask(__name__)
CORS(app)

# --- Initialize Firebase ---
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Load ML Model ---
ml_bundle = joblib.load(MODEL_PATH)
ml_model = ml_bundle['model']
item_encoder = ml_bundle['item_encoder']
storage_encoder = ml_bundle['storage_encoder']

def predict_shelf_life(item, storage):
    """Predict shelf life (days) for a given item and storage."""
    try:
        item_enc = item_encoder.transform([item])[0]
    except ValueError:
        item_enc = item_encoder.transform([item_encoder.classes_[0]])[0]
    try:
        storage_enc = storage_encoder.transform([storage])[0]
    except ValueError:
        storage_enc = storage_encoder.transform([storage_encoder.classes_[0]])[0]
    pred = ml_model.predict([[item_enc, storage_enc]])[0]
    return int(round(pred))

# --- Helper: Load Walmart Inventory ---
def load_walmart_inventory():
    """Load Walmart inventory from mock JSON file."""
    with open(MOCK_API_PATH, 'r') as f:
        data = json.load(f)
    # Remove _comment fields if present
    return [item for item in data if 'item' in item]

# --- Endpoint: Add Item ---
@app.route('/add_item', methods=['POST'])
def add_item():
    """Add an item to user inventory, predict expiry, and store in Firebase."""
    data = request.json
    user_id = data['user_id']
    item = data['item']
    purchase_date = data['purchase_date']
    quantity = data.get('quantity', 1)
    storage = data.get('storage', 'refrigerated')
    # Predict shelf life
    shelf_life = predict_shelf_life(item, storage)
    expiry_date = (datetime.strptime(purchase_date, '%Y-%m-%d') + timedelta(days=shelf_life)).strftime('%Y-%m-%d')
    # Store in Firestore
    inv_ref = db.collection('users').document(user_id).collection('inventory')
    inv_ref.add({
        'item': item,
        'purchase_date': purchase_date,
        'quantity': quantity,
        'storage': storage,
        'predicted_expiry': expiry_date
    })
    return jsonify({'message': 'Item added', 'predicted_expiry': expiry_date})

# --- Endpoint: Get Alerts ---
@app.route('/alerts/<user_id>', methods=['GET'])
def get_alerts(user_id):
    """Return items expiring within 2 days for a user."""
    inv_ref = db.collection('users').document(user_id).collection('inventory')
    now = datetime.now()
    soon = (now + timedelta(days=2)).strftime('%Y-%m-%d')
    alerts = []
    for doc in inv_ref.stream():
        data = doc.to_dict()
        expiry = data.get('predicted_expiry')
        if expiry and now.strftime('%Y-%m-%d') <= expiry <= soon:
            alerts.append({
                'item': data['item'],
                'expiry': expiry,
                'quantity': data.get('quantity', 1)
            })
    return jsonify({'alerts': alerts})

# --- Endpoint: Get Discounts ---
@app.route('/discounts', methods=['GET'])
def get_discounts():
    """Return Walmart's near-expiry items (within 3 days) from mock API."""
    inventory = load_walmart_inventory()
    now = datetime.now()
    soon = (now + timedelta(days=3)).strftime('%Y-%m-%d')
    discounts = [
        item for item in inventory
        if now.strftime('%Y-%m-%d') <= item['expiry'] <= soon
    ]
    return jsonify({'discounts': discounts})

# --- Endpoint: Redeem Discount ---
@app.route('/redeem_discount', methods=['POST'])
def redeem_discount():
    """Log redemption and award loyalty points to user."""
    data = request.json
    user_id = data['user_id']
    item = data['item']
    points = 10  # Fixed for demo
    # Add points
    points_ref = db.collection('users').document(user_id).collection('points')
    points_ref.add({
        'item': item,
        'points': points,
        'timestamp': datetime.now().isoformat()
    })
    return jsonify({'message': f'{points} points awarded for redeeming {item}.'})

# --- Endpoint: Get Metrics ---
@app.route('/metrics/<user_id>', methods=['GET'])
def get_metrics(user_id):
    """Return waste saved for user (mock calculation)."""
    # For demo, count number of items redeemed as waste saved (1kg per item)
    points_ref = db.collection('users').document(user_id).collection('points')
    waste_saved = sum(1 for _ in points_ref.stream())
    # For Walmart, sum all discounts redeemed (mock: 4kg)
    walmart_waste_saved = 4
    return jsonify({'waste_saved_kg': waste_saved, 'walmart_waste_saved_kg': walmart_waste_saved})

# --- Mock Cron Job: Daily Expiry Check ---
@app.route('/run_cron', methods=['POST'])
def run_cron():
    """Mock endpoint to simulate daily expiry checks (for demo)."""
    # In real deployment, this would send notifications
    return jsonify({'message': 'Cron job executed (mock).'})

# --- Main ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 