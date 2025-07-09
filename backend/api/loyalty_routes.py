from flask import Blueprint, jsonify, request
import json
import os
from datetime import datetime

loyalty = Blueprint('loyalty', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "users_loyalty.json")
REDEEMABLE_ITEMS_FILE = os.path.join(BASE_DIR, "mock_api", "redeemable_items.json")

def load_loyalty_data():
    try:
        with open(LOYALTY_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_loyalty_data(data):
    with open(LOYALTY_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def load_redeemable_items():
    try:
        with open(REDEEMABLE_ITEMS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"items": []}

@loyalty.route('/api/loyalty/points/<user_id>', methods=['GET'])
def get_loyalty_points(user_id):
    loyalty_data = load_loyalty_data()
    user_data = loyalty_data.get(user_id, {})
    return jsonify({
        "points": user_data.get('loyalty_points', 0),
        "level": user_data.get('level', 'Bronze'),
        "total_saved_kg": user_data.get('total_saved_kg', 0)
    })

@loyalty.route('/api/loyalty/redeemable-items', methods=['GET'])
def get_redeemable_items():
    items = load_redeemable_items()
    return jsonify(items)

@loyalty.route('/api/loyalty/redeem', methods=['POST'])
def redeem_points():
    data = request.get_json()
    user_id = data.get('user_id')
    item_id = data.get('item_id')
    points_cost = data.get('points_cost')

    if not all([user_id, item_id, points_cost]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    loyalty_data = load_loyalty_data()
    user_data = loyalty_data.get(user_id)

    if not user_data:
        return jsonify({"success": False, "message": "User not found"}), 404

    if user_data['loyalty_points'] < points_cost:
        return jsonify({"success": False, "message": "Insufficient points"}), 400

    # Update user's points
    user_data['loyalty_points'] -= points_cost
    user_data['last_active'] = datetime.now().isoformat()
    loyalty_data[user_id] = user_data

    # Save updated loyalty data
    save_loyalty_data(loyalty_data)

    return jsonify({
        "success": True,
        "message": "Points redeemed successfully",
        "remaining_points": user_data['loyalty_points']
    })
