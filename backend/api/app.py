# Add the scripts directory to the Python path for module resolution
import sys
import os
scripts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts'))
if scripts_dir not in sys.path:
    sys.path.insert(0, scripts_dir)

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime

# Import all necessary modules with error handling
from cart_manage import (
    load_cart_data, save_cart_data, add_item_to_cart, remove_item_from_cart,
    clear_cart, get_cart_summary, checkout_cart, load_loyalty_points,
    save_loyalty_points, add_loyalty_points, get_cart, update_impact_dash,
    add_impact_dash, load_impact_dash_data, get_user_impact_data, load_product_thresholds, get_product_thresholds,
    days_until_expiry, find_best_item_for_cart, find_near_expiry_replacements,
    suggest_cart_and_replacements, get_inventory_items_for_product,
    suggest_cart_and_replacements_auto,
    get_product_impact_preview, calculate_item_impact, update_item_quantity
)

# Import available functions from cart_cli
try:
    from cart_cli import (
        load_inventory, find_item_in_inventory,
        add_item_with_replacement, add_replacement_item,
        test_all_functions
    )
    CART_CLI_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Some cart_cli functions not available: {e}")
    CART_CLI_AVAILABLE = False

# Import calculate_discount from cart_manage if not available in cart_cli
try:
    from cart_cli import calculate_discount, calculate_loyalty_points
except ImportError:
    # Define fallback functions if not available in cart_cli
    def calculate_discount(expiry_date, max_discount=50):
        """Calculate discount based on days until expiry."""
        try:
            days = days_until_expiry(expiry_date)
            if days <= 0:
                return max_discount  # Max discount for expired items
            elif days <= 2:
                return max_discount * 0.8  # 80% of max discount
            elif days <= 5:
                return max_discount * 0.5  # 50% of max discount
            else:
                return 0  # No discount for fresh items
        except:
            return 0
    
    def calculate_loyalty_points(cart):
        """Calculate loyalty points for cart items."""
        try:
            total_items = sum(item.get('quantity', 0) for item in cart.values())
            return total_items  # 1 point per item
        except:
            return 0

# Import replacement utilities
try:
    from replacement_utils import (
        find_nearest_expiry_item, find_best_item_for_cart as replacement_find_best,
        get_replacement_suggestions, get_replacement_message
    )
    REPLACEMENT_UTILS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: replacement_utils not available: {e}")
    REPLACEMENT_UTILS_AVAILABLE = False
    
    # Define fallback functions
    def find_nearest_expiry_item(item_name, inventory_path=None):
        return None
    
    def replacement_find_best(item_name, min_days_threshold=3):
        return None
    
    def get_replacement_suggestions(item_name, near_expiry_threshold=5):
        """Fallback replacement suggestions using cart_manage functions."""
        try:
            # Get inventory items for the product
            inventory_items = get_inventory_items_for_product(item_name)
            if inventory_items:
                # Use the replacement function from cart_manage
                replacements = find_near_expiry_replacements(item_name, inventory_items)
                return replacements
            return []
        except Exception:
            return []
    
    def get_replacement_message(days_until_expiry):
        return "No replacement suggestions available"

# Try to import advanced features
try:
    from inventory_grouping import (
        group_inventory_by_product, 
        find_freshest_item, 
        find_near_expiry_replacements as grouping_find_replacements,
        get_product_summary
    )
    GROUPING_AVAILABLE = True
except ImportError:
    GROUPING_AVAILABLE = False
    print("Warning: inventory_grouping module not available, using fallback functionality")

# Try to import ML prediction
try:
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
    if models_dir not in sys.path:
        sys.path.insert(0, models_dir)
    from predict_expiry import predict_shelf_life
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: ML prediction module not available, using fallback functionality")

# Base directory for file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "impact_dash.json")

app = Flask(__name__)
from flasgger import Swagger
swagger = Swagger(app) 
CORS(app)  # Enable CORS for frontend integration

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint."""
    return jsonify({
        "message": "FreshGuard 2.0 API is running!",
        "version": "2.0",
        "features": {
            "grouped_inventory": GROUPING_AVAILABLE,
            "smart_replacement": True,
            "fresh_item_selection": GROUPING_AVAILABLE,
            "ml_prediction": ML_AVAILABLE,
            "product_thresholds": True,
            "loyalty_system": True,
            "impact_tracking": True
        },
        "endpoints": [
            "/get_inventory",
            "/get_product_details",
            "/get_grouped_inventory", 
            "/suggest_replacements",
            "/suggest_cart_item",
            "/add_to_cart",
            "/add_replacement_to_cart",
            "/remove_from_cart",
            "/update_cart_quantity",
            "/get_cart",
            "/clear_cart",
            "/checkout",
            "/get_alerts",
            "/get_loyalty",
            "/add_loyalty_points",
            "/predict_shelf_life",
            "/user_impact",
            "/update_impact_dash",
            "/load_product_thresholds",
            "/find_freshest_item",
            "/get_product_summary",
            "/get_replacement_suggestions",
            "/test_functions"
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
        elif CART_CLI_AVAILABLE:
            # Use original individual item approach if cart_cli is available
            inventory = load_inventory()
        else:
            # Fallback: load directly from JSON file
            inventory = load_inventory_fallback()
        
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
                if datetime.strptime(item.get('expiry_date', '2099-12-31'), "%Y-%m-%d") <= cutoff
            ]
        
        # Add calculated discount for each item and clean up the response
        clean_inventory = []
        for item in inventory:
            try:
                max_discount = item.get('discount', 0)
                expiry_date = item.get('expiry_date', '2099-12-31')
                effective_discount = calculate_discount(expiry_date, max_discount)
                
                price_per_unit = item.get('price_per_unit', 0)
                if isinstance(price_per_unit, (int, float)):
                    discounted_price = price_per_unit * (1 - effective_discount / 100)
                else:
                    discounted_price = 0
                
                # Calculate days until expiry for urgency display
                from datetime import datetime
                try:
                    expiry_dt = datetime.strptime(expiry_date, "%Y-%m-%d")
                    today = datetime.today()
                    days_left = (expiry_dt - today).days
                except:
                    days_left = 999
                
                # Generate user-friendly cues and messages
                user_cues = []
                primary_message = ""
                savings_message = ""
                urgency_level = "normal"
                
                if days_left <= 0:
                    primary_message = "⚠️ Expired - Remove immediately"
                    user_cues.append("Item expired")
                    urgency_level = "expired"
                elif days_left <= 1:
                    if days_left == 0:
                        primary_message = "🚨 Expires today - Act now!"
                    else:
                        primary_message = "⚡ Expires tomorrow - Act fast!"
                    user_cues.append("Act fast - expires soon")
                    user_cues.append("Help reduce waste")
                    user_cues.append("Maximum savings available")
                    urgency_level = "critical"
                    if effective_discount > 0:
                        savings_message = f"Save {effective_discount:.0f}% • Help the planet"
                elif days_left <= 3:
                    primary_message = f"⏰ Act fast - expires in {days_left} days!"
                    user_cues.append(f"Expires in {days_left} days")
                    user_cues.append("Help reduce waste")
                    if effective_discount > 0:
                        user_cues.append("Earn bonus points")
                        savings_message = f"Save {effective_discount:.0f}% • Earn rewards"
                    urgency_level = "critical"
                elif days_left <= 7:
                    if effective_discount > 0:
                        primary_message = "� Great deal - Still fresh!"
                        user_cues.append("Still fresh")
                        user_cues.append("Great savings")
                        savings_message = f"Save {effective_discount:.0f}%"
                    else:
                        primary_message = "✨ Fresh and quality guaranteed"
                        user_cues.append("Fresh & ready")
                    urgency_level = "warning"
                else:
                    primary_message = "✨ AI will pick the freshest item for you"
                    user_cues.append("Fresh & quality guaranteed")
                    if grouped and GROUPING_AVAILABLE and item.get('total_variants', 1) > 1:
                        user_cues.append("AI picks best option")
                    urgency_level = "normal"
                
                # Add sustainability message for all discounted items
                if effective_discount > 0:
                    user_cues.append("Support sustainability")
                
                # Add environmental impact message based on discount level
                if effective_discount > 30:
                    user_cues.append("🌍 Big environmental impact!")
                elif effective_discount > 10:
                    user_cues.append("♻️ Reduce food waste")
                
                # Create clean item with only essential user-facing information
                clean_item = {
                    "item_id": item.get('item_id'),
                    "item_name": item.get('item_name'),
                    "category": item.get('category'),
                    "price_per_unit": price_per_unit,
                    "discounted_price": round(discounted_price, 2),
                    "discount": effective_discount,
                    "current_stock": item.get('current_stock', 0),
                    "expiry_date": expiry_date,
                    "days_left": days_left,
                    "storage_type": item.get('storage_type'),
                    "urgency": urgency_level,
                    "user_cues": user_cues,
                    "primary_message": primary_message,
                    "savings_message": savings_message
                }
                
                # Add grouping information only if grouped
                if grouped and GROUPING_AVAILABLE:
                    clean_item.update({
                        "total_variants": item.get('total_variants', 1),
                        "has_alternatives": item.get('near_expiry_count', 0) > 0
                    })
                
                clean_inventory.append(clean_item)
                
            except Exception as e:
                # If there's an error, create a minimal clean item
                clean_item = {
                    "item_id": item.get('item_id', 'unknown'),
                    "item_name": item.get('item_name', 'Unknown Item'),
                    "category": item.get('category', 'Other'),
                    "price_per_unit": item.get('price_per_unit', 0),
                    "discounted_price": item.get('price_per_unit', 0),
                    "discount": 0,
                    "current_stock": item.get('current_stock', 0),
                    "expiry_date": item.get('expiry_date', '2099-12-31'),
                    "days_left": 999,
                    "storage_type": item.get('storage_type', 'ambient'),
                    "urgency": "normal"
                }
                clean_inventory.append(clean_item)
                print(f"Warning: Error processing item {item.get('item_id', 'unknown')}: {e}")
        
        return jsonify({
            "success": True,
            "inventory": clean_inventory,
            "count": len(clean_inventory),
            "grouped": grouped and GROUPING_AVAILABLE
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/add_to_cart', methods=['POST'])
@app.route('/add_to_cart', methods=['POST'])
def api_add_to_cart():
    """Add item to cart with replacement suggestion."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
        
        # Validate required fields
        required_fields = ['user_id', 'item_query', 'quantity'
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        user_id = data['user_id']
        item_query = data['item_query']
        quantity = data['quantity']
        
        # Validate data types
        if not isinstance(quantity, int) or quantity <= 0:
            return jsonify({"success": False, "error": "Quantity must be a positive integer"}), 400
        
        if not user_id or not item_query:
            return jsonify({"success": False, "error": "user_id and item_query cannot be empty"}), 400
        
        # Check if cart_cli functions are available
        if not CART_CLI_AVAILABLE:
            return jsonify({
                "success": False, 
                "error": "Cart functionality not available - cart_cli module not loaded"
            }), 503
        
        result = add_item_with_replacement(user_id, item_query, quantity)
        return jsonify(result)
    except KeyError as e:
        return jsonify({"success": False, "error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": f"Error adding to cart: {str(e)}",
            "debug_info": {
                "cart_cli_available": CART_CLI_AVAILABLE,
                "request_data": data if 'data' in locals() else None
            }
        }), 500

@app.route('/add_replacement_to_cart', methods=['POST'])
def api_add_replacement_to_cart():
    """Add replacement item to cart."""
    try:
        data = request.json
        if not data or 'user_id' not in data or 'replacement' not in data or 'quantity' not in data:
            return jsonify({"success": False, "error": "user_id, replacement, and quantity are required"}), 400
        
        user_id = data['user_id']
        replacement = data['replacement']
        quantity = data['quantity']
        
        result = add_replacement_item(user_id, replacement, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error adding replacement to cart: {str(e)}"}), 500

@app.route('/remove_from_cart', methods=['POST'])
def api_remove_from_cart():
    """Remove item from cart."""
    try:
        data = request.json
        if not data or 'user_id' not in data or 'item_id' not in data:
            return jsonify({"success": False, "error": "user_id and item_id are required"}), 400
        
        user_id = data['user_id']
        item_id = data['item_id']
        quantity = data.get('quantity')  # Optional: remove specific quantity
        
        result = remove_item_from_cart(user_id, item_id, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error removing from cart: {str(e)}"}), 500

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
        return jsonify({"success": False, "error": f"Error getting cart: {str(e)}"}), 500

@app.route('/clear_cart', methods=['POST'])
def api_clear_cart():
    """Clear user's cart."""
    try:
        data = request.json
        if not data or 'user_id' not in data:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        user_id = data['user_id']
        
        result = clear_cart(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error clearing cart: {str(e)}"}), 500

@app.route('/checkout', methods=['POST'])
def api_checkout():
    """Checkout user's cart with proper environmental impact calculation."""
    try:
        data = request.json
        if not data or 'user_id' not in data:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        user_id = data['user_id']
        clear_cart_after = data.get('clear_cart', True)
        
        # Get cart first to calculate impact and points
        cart = get_cart(user_id)
        if not cart:
            return jsonify({"success": False, "error": "Cart is empty"}), 400
        
        # Calculate environmental impact for each item in cart
        total_environmental_impact = {
            "food_saved_kg": 0,
            "co2_reduced_kg": 0,
            "items_rescued": 0,
            "total_value": 0
        }
        
        for item_id, item in cart.items():
            item_name = item.get('item_name', '')
            quantity = item.get('quantity', 1)
            category = item.get('category', None)
            
            # Calculate environmental impact for this item
            item_impact = calculate_item_impact(item_name, quantity, category)
            
            total_environmental_impact["food_saved_kg"] += item_impact["food_saved_kg"]
            total_environmental_impact["co2_reduced_kg"] += item_impact["co2_reduced_kg"]
            total_environmental_impact["items_rescued"] += quantity
            total_environmental_impact["total_value"] += item.get('price_per_unit', 0) * quantity
        
        # Calculate total items and points earned
        total_items = sum(item.get('quantity', 0) for item in cart.values())
        points_earned = total_items  # 1 point per item
        
        # Perform checkout
        result = checkout_cart(user_id, points_earned, clear=clear_cart_after)
        
        if result.get("success"):
            # Add environmental impact to result
            result['environmental_impact'] = total_environmental_impact
            
            # Update impact dashboard with calculated values
            try:
                add_impact_dash(
                    user_id,
                    total_food_saved=total_environmental_impact["food_saved_kg"],
                    total_money_saved=total_environmental_impact["total_value"],
                    total_co2_reduced=total_environmental_impact["co2_reduced_kg"],
                    total_loyalty_points=points_earned,
                    total_orders=1,  # One order completed
                    total_items=total_items
                )
                print(f"✅ Updated impact dashboard for {user_id}: {total_environmental_impact}")
            except Exception as impact_error:
                print(f"⚠️ Failed to update impact dashboard: {impact_error}")
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error during checkout: {str(e)}"}), 500

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
        
        if ML_AVAILABLE:
            # Use actual ML model for prediction
            predicted_days = predict_shelf_life(item_name, category, storage_type)
        else:
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
    """Get user's sustainability impact metrics from impact_dash.json."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        # Get user impact data directly from impact_dash.json
        impact_data = get_user_impact_data(user_id)
        
        # Also get loyalty points for consistency
        loyalty_data = load_loyalty_points()
        user_points = loyalty_data.get(user_id, impact_data.get('total_loyalty_points', 0))
        
        # Try to get user level from users_loyalty.json
        loyalty_file = os.path.join(BASE_DIR, "mock_api", "users_loyalty.json")
        level = 'Bronze'  # default
        try:
            with open(loyalty_file, 'r') as f:
                enhanced_data = json.load(f).get(user_id, {})
                level = enhanced_data.get('level', 'Bronze')
        except:
            pass
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "impact": {
                "items_saved": impact_data.get('total_items', 0),
                "food_saved_kg": round(float(impact_data.get('total_food_saved', 0)), 2),
                "co2_saved_kg": round(float(impact_data.get('total_co2_reduced', 0)), 2),
                "money_saved": round(float(impact_data.get('total_money_saved', 0)), 2),
                "loyalty_points": max(user_points, impact_data.get('total_loyalty_points', 0)),
                "level": level,
                "total_orders": impact_data.get('total_orders', 0)
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

@app.route('/get_grouped_inventory', methods=['GET'])
def api_get_grouped_inventory():
    """Get inventory grouped by product name with fresh/near-expiry separation."""
    try:
        near_expiry_threshold = int(request.args.get('near_expiry_threshold', 5))
        
        if GROUPING_AVAILABLE:
            grouped_data = group_inventory_by_product(near_expiry_threshold=near_expiry_threshold)
            return jsonify({
                "success": True,
                "grouped_products": grouped_data['grouped_products'],
                "all_grouped": grouped_data['all_grouped'],
                "total_products": len(grouped_data['all_grouped']),
                "grouping_enabled": True
            })
        else:
            # Fallback to regular inventory
            inventory = load_inventory()
            return jsonify({
                "success": True,
                "inventory": inventory,
                "total_products": len(inventory),
                "grouping_enabled": False,
                "message": "Grouping not available, returning individual items"
            })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error getting grouped inventory: {str(e)}"}), 500

@app.route('/suggest_replacements', methods=['POST'])
def api_suggest_replacements():
    """Get replacement suggestions for a product (near-expiry items only)."""
    try:
        data = request.json
        if not data or 'product_name' not in data:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        product_name = data['product_name']
        near_expiry_threshold = data.get('near_expiry_threshold', 5)
        
        replacements = get_replacement_suggestions(product_name, near_expiry_threshold)
        
        return jsonify({
            "success": True,
            "product_name": product_name,
            "replacements": replacements,
            "count": len(replacements),
            "threshold_days": near_expiry_threshold
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error getting replacement suggestions: {str(e)}"}), 500

@app.route('/suggest_cart_item', methods=['POST'])
def api_suggest_cart_item():
    """Suggest the best item for adding to cart with replacement options."""
    try:
        data = request.json
        if not data or 'product_name' not in data:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        product_name = data['product_name']
        
        # Get comprehensive suggestions
        suggestion = suggest_cart_and_replacements_auto(product_name)
        
        return jsonify({
            "success": True,
            "product_name": product_name,
            "best_item": suggestion.get('best_item'),
            "warning": suggestion.get('warning'),
            "incentive": suggestion.get('incentive'),
            "replacements": suggestion.get('replacements', []),
            "replacement_count": len(suggestion.get('replacements', []))
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error suggesting cart item: {str(e)}"}), 500

@app.route('/add_loyalty_points', methods=['POST'])
def api_add_loyalty_points():
    """Add loyalty points to a user."""
    try:
        data = request.json
        if not data or 'user_id' not in data or 'points' not in data:
            return jsonify({"success": False, "error": "user_id and points are required"}), 400
        
        user_id = data['user_id']
        points = int(data['points'])
        
        total_points = add_loyalty_points(user_id, points)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "points_added": points,
            "total_loyalty_points": total_points
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error adding loyalty points: {str(e)}"}), 500

@app.route('/update_impact_dash', methods=['POST'])
def api_update_impact_dash():
    """Update user's impact dashboard metrics."""
    try:
        data = request.json
        if not data or 'user_id' not in data:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        user_id = data['user_id']
        
        # Extract metrics with defaults
        metrics = {
            'total_food_saved': data.get('total_food_saved', 0),
            'total_money_saved': data.get('total_money_saved', 0),
            'total_co2_reduced': data.get('total_co2_reduced', 0),
            'total_loyalty_points': data.get('total_loyalty_points', 0),
            'total_orders': data.get('total_orders', 0),
            'total_items': data.get('total_items', 0)
        }
        
        # Use add_impact_dash for incremental updates or update_impact_dash for absolute values
        update_type = data.get('update_type', 'add')  # 'add' or 'set'
        
        if update_type == 'add':
            result = add_impact_dash(user_id, **metrics)
        else:
            result = update_impact_dash(user_id, **metrics)
        
        if result:
            return jsonify({
                "success": True,
                "user_id": user_id,
                "updated_metrics": result,
                "update_type": update_type
            })
        else:
            return jsonify({"success": False, "error": "Failed to update impact dashboard"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "error": f"Error updating impact dashboard: {str(e)}"}), 500

@app.route('/load_product_thresholds', methods=['GET'])
def api_load_product_thresholds():
    """Load product expiry thresholds configuration."""
    try:
        thresholds = load_product_thresholds()
        
        return jsonify({
            "success": True,
            "thresholds": thresholds,
            "total_configured": len(thresholds)
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error loading product thresholds: {str(e)}"}), 500

@app.route('/get_product_threshold', methods=['GET'])
def api_get_product_threshold():
    """Get threshold configuration for a specific product."""
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        threshold = get_product_thresholds(product_name)
        
        return jsonify({
            "success": True,
            "product_name": product_name,
            "threshold": threshold
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error getting product threshold: {str(e)}"}), 500

@app.route('/find_freshest_item', methods=['POST'])
def api_find_freshest_item():
    """Find the freshest available item for a product."""
    try:
        data = request.json
        if not data or 'product_name' not in data:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        product_name = data['product_name']
        min_days_threshold = data.get('min_days_threshold', 3)
        
        if GROUPING_AVAILABLE:
            freshest_item = find_freshest_item(product_name, min_days_threshold=min_days_threshold)
        else:
            # Fallback using replacement_utils
            freshest_item = replacement_find_best(product_name, min_days_threshold)
        
        if freshest_item:
            return jsonify({
                "success": True,
                "product_name": product_name,
                "freshest_item": freshest_item,
                "days_until_expiry": days_until_expiry(freshest_item['expiry_date']),
                "meets_threshold": days_until_expiry(freshest_item['expiry_date']) >= min_days_threshold
            })
        else:
            return jsonify({
                "success": False,
                "error": f"No items found for product: {product_name}",
                "product_name": product_name
            }), 404
    except Exception as e:
        return jsonify({"success": False, "error": f"Error finding freshest item: {str(e)}"}), 500

@app.route('/enhanced_predict_shelf_life', methods=['POST'])
def api_enhanced_predict_shelf_life():
    """Enhanced shelf life prediction using ML model if available."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "Request data is required"}), 400
        
        # Required fields
        required_fields = ['item_name', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        if ML_AVAILABLE:
            # Use ML model for prediction
            storage_type = data.get('storage_type', 'refrigerated')
            
            # Load sensor data from file if not provided in request
            sensor_data = load_sensor_data(storage_type)
            
            sample = {
                "item_name": data['item_name'],
                "category": data['category'],
                "storage_type": storage_type,
                "current_temp_c": data.get('current_temp_c', sensor_data.get('current_temp_c', get_default_temp(storage_type))),
                "humidity": data.get('humidity', sensor_data.get('humidity', get_default_humidity(storage_type))),
                "price_per_unit": data.get('price_per_unit', 1.0),
                "current_stock": data.get('current_stock', 10),
                "sales_per_day": data.get('sales_per_day', 5)
            }
            
            predicted_days = predict_shelf_life(sample)
            
            if predicted_days is not None:
                return jsonify({
                    "success": True,
                    "item_name": data['item_name'],
                    "category": data['category'],
                    "predicted_shelf_life_days": predicted_days,
                    "prediction_method": "ml_model",
                    "sample_data": sample
                })
            else:
                # Fall back to rule-based prediction
                return api_predict_shelf_life()
        else:
            # Use rule-based prediction
            return api_predict_shelf_life()
            
    except Exception as e:
        return jsonify({"success": False, "error": f"Error predicting shelf life: {str(e)}"}), 500

@app.route('/test_functions', methods=['POST'])
def api_test_functions():
    """Test all cart functions for a user (for debugging)."""
    try:
        data = request.json
        if not data or 'user_id' not in data:
            return jsonify({"success": False, "error": "user_id is required"}), 400
        
        user_id = data['user_id']
        
        # Capture test output
        import io
        import sys
        old_stdout = sys.stdout
        sys.stdout = captured_output = io.StringIO()
        
        try:
            test_all_functions(user_id)
            test_output = captured_output.getvalue()
        finally:
            sys.stdout = old_stdout
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "test_output": test_output,
            "message": "All functions tested successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Error testing functions: {str(e)}"}), 500

@app.route('/inventory_items_for_product', methods=['GET'])
def api_inventory_items_for_product():
    """Get all inventory items for a specific product name."""
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({"success": False, "error": "product_name is required"}), 400
        
        items = get_inventory_items_for_product(product_name)
        
        # Add calculated fields
        for item in items:
            item['days_until_expiry'] = days_until_expiry(item['expiry_date'])
            item['is_near_expiry'] = item['days_until_expiry'] <= 5
            item['is_critical'] = item['days_until_expiry'] <= 2
        
        return jsonify({
            "success": True,
            "product_name": product_name,
            "items": items,
            "total_items": len(items),
            "in_stock_items": len([i for i in items if i.get('current_stock', 0) > 0]),
            "near_expiry_count": len([i for i in items if i.get('days_until_expiry', 999) <= 5]),
            "critical_count": len([i for i in items if i.get('days_until_expiry', 999) <= 2])
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Error getting inventory items: {str(e)}"}), 500

@app.route('/days_until_expiry', methods=['POST'])
def api_days_until_expiry():
    """Calculate days until expiry for a given date."""
    try:
        data = request.json
        if not data or 'expiry_date' not in data:
            return jsonify({"success": False, "error": "expiry_date is required"}), 400
        
        expiry_date = data['expiry_date']
        days = days_until_expiry(expiry_date)
        
        return jsonify({
            "success": True,
            "expiry_date": expiry_date,
            "days_until_expiry": days,
            "is_expired": days < 0,
            "is_near_expiry": 0 <= days <= 5,
            "is_critical": 0 <= days <= 2,
            "urgency_level": "expired" if days < 0 else "critical" if days <= 2 else "warning" if days <= 5 else "safe"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Error calculating days until expiry: {str(e)}"}), 500

@app.route('/get_product_impact_preview', methods=['POST'])
def api_get_product_impact_preview():
    """Get environmental impact preview for a specific product."""
    try:
        data = request.json
        if not data or 'item_name' not in data:
            return jsonify({"success": False, "error": "item_name is required"}), 400
        
        item_name = data['item_name']
        quantity = data.get('quantity', 1)
        category = data.get('category')
        
        preview = get_product_impact_preview(item_name, quantity, category)
        
        return jsonify({
            "success": True,
            "item_name": item_name,
            "quantity": quantity,
            "category": category,
            **preview
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Error getting impact preview: {str(e)}"}), 500

# Enhanced error handlers with more detailed logging
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "success": False, 
        "error": "Bad request - Invalid parameters",
        "status_code": 400,
        "timestamp": datetime.now().isoformat()
    }), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False, 
        "error": "Endpoint not found",
        "status_code": 404,
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": [
            "/", "/get_inventory", "/get_grouped_inventory", "/suggest_replacements",
            "/suggest_cart_item", "/add_to_cart", "/add_replacement_to_cart",
            "/remove_from_cart", "/update_cart_quantity", "/get_cart", "/clear_cart", "/checkout",
            "/get_alerts", "/get_loyalty", "/add_loyalty_points", "/predict_shelf_life",
            "/enhanced_predict_shelf_life", "/user_impact", "/update_impact_dash",
            "/load_product_thresholds", "/get_product_threshold", "/find_freshest_item",
            "/get_product_details", "/test_functions", "/inventory_items_for_product",
            "/days_until_expiry", "/get_product_impact_preview"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False, 
        "error": "Internal server error",
        "status_code": 500,
        "timestamp": datetime.now().isoformat(),
        "message": "Please check server logs for details"
    }), 500

# Health check and debugging endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check with feature availability."""
    try:
        # Test basic functionality
        inventory = load_inventory()
        cart_data = load_cart_data()
        loyalty_data = load_loyalty_points()
        thresholds = load_product_thresholds()
        
        return jsonify({
            "success": True,
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "features": {
                "inventory_loading": len(inventory) > 0,
                "cart_system": True,
                "loyalty_system": len(loyalty_data) >= 0,
                "product_thresholds": len(thresholds) >= 0,
                "grouping_available": GROUPING_AVAILABLE,
                "ml_available": ML_AVAILABLE
            },
            "stats": {
                "inventory_items": len(inventory),
                "configured_thresholds": len(thresholds),
                "user_loyalty_records": len(loyalty_data)
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

def load_sensor_data(storage_type=None):
    """Load sensor data from JSON files.
    
    Args:
        storage_type (str, optional): Specific storage type to get data for.
                                    If None, returns all sensor data.
    
    Returns:
        dict: Sensor data for the specified storage type or all data.
    """
    try:
        # Try to load from current_sensors_data.json first (structured by storage type)
        current_sensors_path = os.path.join(os.path.dirname(__file__), '..', 'mock_api', 'current_sensors_data.json')
        if os.path.exists(current_sensors_path):
            with open(current_sensors_path, 'r') as f:
                sensor_data = json.load(f)
            
            if storage_type and storage_type in sensor_data:
                return sensor_data[storage_type]
            elif storage_type:
                # If specific storage type not found, return default values
                return get_default_sensor_data(storage_type)
            else:
                return sensor_data
        
        # Fallback to sensors_data.json (array format)
        sensors_path = os.path.join(os.path.dirname(__file__), '..', 'mock_api', 'sensors_data.json')
        if os.path.exists(sensors_path):
            with open(sensors_path, 'r') as f:
                sensor_data = json.load(f)
            
            if storage_type:
                # Find data for specific storage type
                for sensor in sensor_data:
                    if sensor.get('storage_type') == storage_type:
                        return {
                            'current_temp_c': sensor.get('current_temp_c', get_default_temp(storage_type)),
                            'humidity': sensor.get('humidity', get_default_humidity(storage_type)),
                            'timestamp': sensor.get('timestamp')
                        }
                # If not found, return defaults
                return get_default_sensor_data(storage_type)
            else:
                return sensor_data
        
        # If no files found, return defaults
        if storage_type:
            return get_default_sensor_data(storage_type)
        else:
            return {
                'refrigerated': get_default_sensor_data('refrigerated'),
                'ambient': get_default_sensor_data('ambient'),
                'frozen': get_default_sensor_data('frozen')
            }
            
    except Exception as e:
        print(f"Error loading sensor data: {e}")
        # Return default values if file loading fails
        if storage_type:
            return get_default_sensor_data(storage_type)
        else:
            return {
                'refrigerated': get_default_sensor_data('refrigerated'),
                'ambient': get_default_sensor_data('ambient'),
                'frozen': get_default_sensor_data('frozen')
            }

def get_default_temp(storage_type):
    """Get default temperature for storage type."""
    defaults = {
        'refrigerated': 4.0,
        'frozen': -18.0,
        'ambient': 21.0
    }
    return defaults.get(storage_type, 21.0)

def get_default_humidity(storage_type):
    """Get default humidity for storage type."""
    defaults = {
        'refrigerated': 0.85,
        'frozen': 0.40,
        'ambient': 0.60
    }
    return defaults.get(storage_type, 0.60)

def get_default_sensor_data(storage_type):
    """Get default sensor data for a storage type."""
    return {
        'current_temp_c': get_default_temp(storage_type),
        'humidity': get_default_humidity(storage_type),
        'timestamp': datetime.now().isoformat()
    }

def load_inventory_fallback():
    """Fallback function to load inventory directly from JSON file."""
    try:
        # Try to load from current_walmart_inventory.json
        inventory_file = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")
        if os.path.exists(inventory_file):
            with open(inventory_file, 'r') as f:
                data = json.load(f)
                return data.get('inventory', [])
        
        # Try alternative inventory file locations
        alternative_paths = [
            os.path.join(BASE_DIR, "models", "walmart_inventory.json"),
            os.path.join(BASE_DIR, "models", "data", "walmart_inventory.json"),
            os.path.join(BASE_DIR, "mock_api", "walmart_inventory.json")
        ]
        
        for path in alternative_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    data = json.load(f)
                    # Handle different JSON structures
                    if isinstance(data, list):
                        return data
                    elif isinstance(data, dict) and 'inventory' in data:
                        return data['inventory']
                    else:
                        return []
        
        # If no files found, return empty list
        print("Warning: No inventory files found, returning empty inventory")
        return []
        
    except Exception as e:
        print(f"Error loading inventory fallback: {e}")
        return []

# Fallback function for loading inventory when cart_cli is not available
def load_inventory():
    """Load inventory using fallback method if cart_cli is not available."""
    try:
        if CART_CLI_AVAILABLE:
            # Use cart_cli function if available
            return load_inventory_from_cli()
        else:
            # Use fallback method
            return load_inventory_fallback()
    except Exception as e:
        print(f"Error loading inventory: {e}")
        return load_inventory_fallback()

def load_inventory_from_cli():
    """Load inventory from cart_cli module if available."""
    try:
        from cart_cli import load_inventory as cli_load_inventory
        return cli_load_inventory()
    except ImportError:
        return load_inventory_fallback()

@app.route('/update_cart_quantity', methods=['POST'])
def api_update_cart_quantity():
    """Update the quantity of an item in the cart."""
    try:
        data = request.json
        if not data or 'user_id' not in data or 'item_id' not in data or 'quantity' not in data:
            return jsonify({"success": False, "error": "user_id, item_id, and quantity are required"}), 400
        
        user_id = data['user_id']
        item_id = data['item_id']
        quantity = data['quantity']
        
        if not isinstance(quantity, int) or quantity < 0:
            return jsonify({"success": False, "error": "Quantity must be a non-negative integer"}), 400
        
        result = update_item_quantity(user_id, item_id, quantity)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error updating quantity: {str(e)}"}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting FreshGuard 2.0 API Server")
    print("="*60)
    print("📋 Available endpoints:")
    print("   Core Functions:")
    print("   - GET  /                          - Health check and API info")
    print("   - GET  /health                    - Detailed health check")
    print("   - GET  /get_inventory             - Get inventory with filtering")
    print("   - GET  /get_grouped_inventory     - Get grouped inventory")
    print("   - GET  /get_product_details       - Get product details")
    print("   ")
    print("   Cart Management:")
    print("   - POST /add_to_cart               - Add item to cart")
    print("   - POST /add_replacement_to_cart   - Add replacement item")
    print("   - POST /remove_from_cart          - Remove item from cart")
    print("   - GET  /get_cart                  - Get cart contents")
    print("   - POST /clear_cart                - Clear user cart")
    print("   - POST /checkout                  - Checkout cart")
    print("   - POST /update_cart_quantity      - Update item quantity in cart")
    print("   ")
    print("   Smart Features:")
    print("   - POST /suggest_replacements      - Get replacement suggestions")
    print("   - POST /suggest_cart_item         - Suggest best cart item")
    print("   - POST /find_freshest_item        - Find freshest item")
    print("   - GET  /inventory_items_for_product - Get all product variants")
    print("   ")
    print("   User & Loyalty:")
    print("   - GET  /get_loyalty               - Get user loyalty points")
    print("   - POST /add_loyalty_points        - Add loyalty points")
    print("   - GET  /user_impact               - Get sustainability metrics")
    print("   - POST /update_impact_dash        - Update impact dashboard")
    print("   ")
    print("   Alerts & Predictions:")
    print("   - GET  /get_alerts                - Get expiring items")
    print("   - POST /predict_shelf_life        - Predict shelf life (rule-based)")
    print("   - POST /enhanced_predict_shelf_life - ML-powered prediction")
    print("   - POST /days_until_expiry         - Calculate expiry days")
    print("   ")
    print("   Configuration:")
    print("   - GET  /load_product_thresholds   - Load threshold config")
    print("   - GET  /get_product_threshold     - Get specific threshold")
    print("   ")
    print("   Testing & Debug:")
    print("   - POST /test_functions            - Test all functions")
    print("   ")
    print("🔧 Features available:")
    print(f"   - Inventory Grouping: {'✅' if GROUPING_AVAILABLE else '❌'}")
    print(f"   - ML Predictions: {'✅' if ML_AVAILABLE else '❌'}")
    print("   - Smart Replacements: ✅")
    print("   - Loyalty System: ✅")
    print("   - Impact Tracking: ✅")
    print("   - Product Thresholds: ✅")
    print("")
    print("🌐 Server starting on http://0.0.0.0:5000")
    print("📚 Frontend can integrate with these endpoints")
    print("🐛 Use /health for debugging and feature status")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)