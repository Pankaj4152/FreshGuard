from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json

# Add the scripts directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from cart_manage import (
    load_cart_data, save_cart_data, add_item_to_cart, remove_item_from_cart,
    clear_cart, get_cart_summary, checkout_cart, load_loyalty_points,
    save_loyalty_points, add_loyalty_points, get_cart
)
from cart_cli import (
    load_inventory, find_item_in_inventory, calculate_discount,
    calculate_loyalty_points, add_item_with_replacement, add_replacement_item
)
from replacement_utils import find_nearest_expiry_item

# Try to import new grouping functionality
try:
    from inventory_grouping import (
        group_inventory_by_product, 
        find_freshest_item, 
        find_near_expiry_replacements,
        get_product_summary
    )
    GROUPING_AVAILABLE = True
except ImportError:
    GROUPING_AVAILABLE = False
    print("Warning: inventory_grouping module not available, using fallback functionality")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Base directory for file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint."""
    return jsonify({
        "message": "FreshGuard 2.0 API is running!",
        "version": "2.0",
        "features": {
            "grouped_inventory": GROUPING_AVAILABLE,
            "smart_replacement": True,
            "fresh_item_selection": GROUPING_AVAILABLE
        },
        "endpoints": [
            "/get_inventory",
            "/get_product_details",
            "/add_to_cart",
            "/add_replacement_to_cart",
            "/remove_from_cart",
            "/get_cart",
            "/clear_cart",
            "/checkout",
            "/get_alerts",
            "/get_loyalty",
            "/predict_shelf_life"
        ]
    })

@app.route('/get_inventory', methods=['GET'])
def get_inventory():
    """Get all inventory items with optional filtering and grouping."""
    try:
        category = request.args.get('category')
        expiring_soon = request.args.get('expiring_soon', 'false').lower() == 'true'
        grouped = request.args.get('grouped', 'true').lower() == 'true'  # Default to grouped
        
        if grouped and GROUPING_AVAILABLE:
            # Use new grouped inventory approach
            grouped_data = group_inventory_by_product()
            inventory = grouped_data['all_grouped']
        else:
            # Use original individual item approach for backward compatibility
            inventory = load_inventory()
        
        # Filter by category if provided
        if category:
            inventory = [item for item in inventory if item.get('category', '').lower() == category.lower()]
        
        # Filter by expiring soon (≤2 days) if requested
        if expiring_soon:
            from datetime import datetime, timedelta
            today = datetime.today()
            cutoff = today + timedelta(days=2)
            inventory = [
                item for item in inventory 
                if datetime.strptime(item['expiry_date'], "%Y-%m-%d") <= cutoff
            ]
        
        # Add calculated discount for each item
        for item in inventory:
            max_discount = item.get('discount', 0)
            effective_discount = calculate_discount(item['expiry_date'], max_discount)
            item['effective_discount'] = effective_discount
            item['discounted_price'] = item['price_per_unit'] * (1 - effective_discount / 100)
        
        return jsonify({
            "success": True,
            "inventory": inventory,
            "count": len(inventory),
            "grouped": grouped and GROUPING_AVAILABLE
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/add_to_cart', methods=['POST'])
def api_add_to_cart():
    """Add item to cart with replacement suggestion."""
    try:
        data = request.json
        user_id = data['user_id']
        item_query = data['item_query']
        quantity = data['quantity']
        
        result = add_item_with_replacement(user_id, item_query, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/add_replacement_to_cart', methods=['POST'])
def api_add_replacement_to_cart():
    """Add replacement item to cart."""
    try:
        data = request.json
        user_id = data['user_id']
        replacement = data['replacement']
        quantity = data['quantity']
        
        result = add_replacement_item(user_id, replacement, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/remove_from_cart', methods=['POST'])
def api_remove_from_cart():
    """Remove item from cart."""
    try:
        data = request.json
        user_id = data['user_id']
        item_id = data['item_id']
        quantity = data.get('quantity')  # Optional: remove specific quantity
        
        result = remove_item_from_cart(user_id, item_id, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_cart', methods=['GET'])
def api_get_cart():
    """Get user's cart contents."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        cart_summary = get_cart_summary(user_id)
        
        # Ensure compatibility with frontend expectations
        return jsonify({
            "success": True,
            "user_id": user_id,
            "cart": cart_summary["cart"],
            "items": cart_summary["cart"],  # Frontend expects 'items' field
            "total": cart_summary["total"],
            "count": len(cart_summary["cart"])
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/clear_cart', methods=['POST'])
def api_clear_cart():
    """Clear user's cart."""
    try:
        data = request.json
        user_id = data['user_id']
        
        result = clear_cart(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/checkout', methods=['POST'])
def api_checkout():
    """Checkout user's cart."""
    try:
        data = request.json
        user_id = data['user_id']
        clear_cart_after = data.get('clear_cart', True)
        
        # Get cart first to calculate points
        cart = get_cart(user_id)
        if not cart:
            return jsonify({"success": False, "error": "Cart is empty"}), 400
        
        # Calculate points earned based on cart items
        total_items = sum(item.get('quantity', 0) for item in cart.values())
        points_earned = total_items  # 1 point per item
        
        result = checkout_cart(user_id, points_earned, clear=clear_cart_after)
        
        # Add food saved calculation (example: assume 1 item = 0.5kg food saved)
        if result.get("success"):
            food_saved_kg = total_items * 0.5  # Rough estimate
            co2_saved_kg = food_saved_kg * 2.5  # Rough CO2 calculation
            
            result['environmental_impact'] = {
                "food_saved_kg": food_saved_kg,
                "co2_saved_kg": co2_saved_kg,
                "items_rescued": total_items
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_alerts', methods=['GET'])
def api_get_alerts():
    """Get items expiring soon (≤2 days)."""
    try:
        user_id = request.args.get('user_id')
        days_threshold = int(request.args.get('days', 2))
        
        from datetime import datetime, timedelta
        today = datetime.today()
        cutoff = today + timedelta(days=days_threshold)
        
        inventory = load_inventory()
        expiring_items = []
        
        for item in inventory:
            expiry_date = datetime.strptime(item['expiry_date'], "%Y-%m-%d")
            if expiry_date <= cutoff and item['current_stock'] > 0:
                days_left = (expiry_date - today).days
                max_discount = item.get('discount', 0)
                effective_discount = calculate_discount(item['expiry_date'], max_discount)
                
                expiring_items.append({
                    **item,
                    "days_left": days_left,
                    "effective_discount": effective_discount,
                    "discounted_price": item['price_per_unit'] * (1 - effective_discount / 100)
                })
        
        return jsonify({
            "success": True,
            "alerts": expiring_items,
            "count": len(expiring_items),
            "days_threshold": days_threshold
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_loyalty', methods=['GET'])
def api_get_loyalty():
    """Get user's loyalty points."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        loyalty_data = load_loyalty_points()
        user_points = loyalty_data.get(user_id, 0)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "loyalty_points": user_points,
            "points": user_points  # Frontend compatibility
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/predict_shelf_life', methods=['POST'])
def api_predict_shelf_life():
    """Predict shelf life for a given item (placeholder for ML model)."""
    try:
        data = request.json
        item_name = data.get('item_name')
        category = data.get('category')
        storage_type = data.get('storage_type', 'refrigerated')
        
        # Placeholder prediction logic (replace with actual ML model)
        predictions = {
            'cheese': 7,
            'milk': 5,
            'bread': 3,
            'meat': 4,
            'vegetables': 6
        }
        
        predicted_days = predictions.get(item_name.lower(), 5)  # Default 5 days
        
        return jsonify({
            "success": True,
            "item_name": item_name,
            "predicted_shelf_life_days": predicted_days,
            "storage_type": storage_type,
            "category": category
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/user_impact', methods=['GET'])
def api_user_impact():
    """Get user's sustainability impact metrics."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        # Load user loyalty data
        loyalty_data = load_loyalty_points()
        user_points = loyalty_data.get(user_id, 0)
        
        # Try to get enhanced user data from users_loyalty.json
        loyalty_file = os.path.join(BASE_DIR, "mock_api", "users_loyalty.json")
        enhanced_data = {}
        try:
            with open(loyalty_file, 'r') as f:
                enhanced_data = json.load(f).get(user_id, {})
        except:
            pass
        
        # Calculate impact metrics
        items_saved = enhanced_data.get('total_orders', 0) * 3  # Avg 3 items per order
        food_saved_kg = enhanced_data.get('total_saved_kg', items_saved * 0.5)  # 0.5kg per item
        co2_saved_kg = food_saved_kg * 2.5  # CO2 calculation
        money_saved = items_saved * 2.5  # Average savings per item
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "impact": {
                "items_saved": items_saved,
                "food_saved_kg": round(food_saved_kg, 2),
                "co2_saved_kg": round(co2_saved_kg, 2),
                "money_saved": round(money_saved, 2),
                "loyalty_points": user_points,
                "level": enhanced_data.get('level', 'Bronze'),
                "total_orders": enhanced_data.get('total_orders', 0)
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_product_details', methods=['GET'])
def get_product_details():
    """Get detailed information about a product including all variants."""
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        if GROUPING_AVAILABLE:
            product_summary = get_product_summary(product_name)
            
            if not product_summary:
                return jsonify({
                    "success": False, 
                    "error": f"Product '{product_name}' not found"
                }), 404
            
            return jsonify({
                "success": True,
                "product": product_summary
            })
        else:
            # Fallback to basic functionality if inventory_grouping not available
            inventory = load_inventory()
            matching_items = [
                item for item in inventory 
                if item['item_name'].lower() == product_name.lower()
            ]
            
            if not matching_items:
                return jsonify({
                    "success": False, 
                    "error": f"Product '{product_name}' not found"
                }), 404
            
            return jsonify({
                "success": True,
                "product": {
                    "product_name": product_name,
                    "total_variants": len(matching_items),
                    "all_items": matching_items
                }
            })
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Starting FreshGuard 2.0 API...")
    print("Available endpoints:")
    print("- GET  /get_inventory")
    print("- POST /add_to_cart")
    print("- POST /add_replacement_to_cart")
    print("- POST /remove_from_cart")
    print("- GET  /get_cart")
    print("- POST /clear_cart")
    print("- POST /checkout")
    print("- GET  /get_alerts")
    print("- GET  /get_loyalty")
    print("- POST /predict_shelf_life")
    print("- GET  /user_impact")
    print("- GET  /get_product_details")
    
    app.run(debug=True, host='0.0.0.0', port=5000)