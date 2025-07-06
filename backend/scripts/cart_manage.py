import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CART_FILE = os.path.join(BASE_DIR, "mock_api", "users_cart.json")
LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "impact_dash.json")
THRESHOLD_FILE = os.path.join(BASE_DIR, "mock_api", "product_thresholds.json")

def update_cart_summary(user_id, cart_data):
    """Recalculate and update summary fields for a user's cart."""
    try:
        user_cart = cart_data.get(user_id, {})
        # Exclude summary fields from item iteration
        items = {k: v for k, v in user_cart.items() if not k.startswith('total_') and k not in ['food_saved', 'co2_reduced']}
        total_price = sum(item.get('quantity', 0) * item.get('price_per_unit', 0) for item in items.values())
        cart_data[user_id]['total_price'] = round(total_price, 3)
        cart_data[user_id]['total_price_after_discount'] = round(total_price, 3)
        cart_data[user_id]['food_saved'] = 0
        cart_data[user_id]['co2_reduced'] = 0
    except Exception as e:
        print(f"Error updating cart summary for user {user_id}: {e}")

def load_cart_data(file_path=CART_FILE):
    """Load cart data from JSON file. Returns an empty dict if the file does not exist or is invalid."""
    if not os.path.exists(file_path):
        return {}
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (json.JSONDecodeError, FileNotFoundError, PermissionError) as e:
        print(f"Error loading cart data: {e}")
        return {}

def save_cart_data(cart_data, file_path=CART_FILE):
    """Saves the provided cart data to a specified JSON file in an atomic and safe manner."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    temp_file = file_path + ".tmp"
    try:
        with open(temp_file, 'w') as file:
            json.dump(cart_data, file, indent=2)
        os.replace(temp_file, file_path)
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        print(f"Error saving cart data: {e}")
        raise

def add_item_to_cart(user_id, item_id, item_name, quantity, price_per_unit):
    """Add or update an item in a user's cart."""
    try:
        cart_data = load_cart_data()
        if user_id not in cart_data:
            cart_data[user_id] = {}
        if item_id in cart_data[user_id]:
            cart_data[user_id][item_id]['quantity'] += quantity
        else:
            cart_data[user_id][item_id] = {
                'item_name': item_name,
                'quantity': quantity,
                'price_per_unit': price_per_unit,
                'added_at': datetime.now().isoformat()
            }
        update_cart_summary(user_id, cart_data)
        save_cart_data(cart_data)
        return {"success": True, "message": "Item added to cart."}
    except Exception as e:
        return {"success": False, "message": f"Error adding item: {e}"}

def remove_item_from_cart(user_id, item_id, quantity=None):
    """
    Remove an item or a specific quantity from a user's cart.
    If quantity is None or >= current, remove the item completely.
    """
    try:
        cart_data = load_cart_data()
        if user_id in cart_data and item_id in cart_data[user_id]:
            if quantity is None or quantity >= cart_data[user_id][item_id]['quantity']:
                del cart_data[user_id][item_id]
            else:
                cart_data[user_id][item_id]['quantity'] -= quantity
            # If only summary fields remain, clear cart
            item_keys = [k for k in cart_data[user_id] if not k.startswith('total_') and k not in ['food_saved', 'co2_reduced']]
            if not item_keys:
                cart_data[user_id] = {
                    'total_price': 0,
                    'total_price_after_discount': 0,
                    'food_saved': 0,
                    'co2_reduced': 0
                }
            else:
                update_cart_summary(user_id, cart_data)
            save_cart_data(cart_data)
            return {"success": True, "message": "Item removed from cart."}
        return {"success": False, "message": "Item not found in cart."}
    except Exception as e:
        return {"success": False, "message": f"Error removing item: {e}"}

def clear_cart(user_id):
    """Clear all items from a user's cart but keep the user_id and reset summary fields."""
    try:
        cart_data = load_cart_data()
        if user_id in cart_data:
            cart_data[user_id] = {
                'total_price': 0,
                'total_price_after_discount': 0,
                'food_saved': 0,
                'co2_reduced': 0
            }
            save_cart_data(cart_data)
            return {"success": True, "message": "Cart cleared."}
        return {"success": True, "message": "Cart already empty."}
    except Exception as e:
        return {"success": False, "message": f"Error clearing cart: {e}"}

def get_cart(user_id):
    """Return the user's cart as a dict (excluding summary fields)."""
    try:
        cart_data = load_cart_data()
        user_cart = cart_data.get(user_id, {})
        return {k: v for k, v in user_cart.items() if not k.startswith('total_') and k not in ['food_saved', 'co2_reduced']}
    except Exception as e:
        print(f"Error getting cart for user {user_id}: {e}")
        return {}

def get_cart_total(user_id):
    """Return the total price for the user's cart and fix stored value if incorrect."""
    try:
        cart_data = load_cart_data()
        user_cart = cart_data.get(user_id, {})
        cart_total = user_cart.get('total_price', 0)
        if cart_total is None:
            cart_total = 0
        # Only sum actual items, not summary fields
        items = {k: v for k, v in user_cart.items() if not k.startswith('total_') and k not in ['food_saved', 'co2_reduced']}
        calc_cat_total = sum(item.get('quantity', 0) * item.get('price_per_unit', 0) for item in items.values())
        if calc_cat_total != cart_total:
            print(f"Warning: Cart total mismatch for user {user_id}. Calculated: {calc_cat_total}, Stored: {cart_total}. Fixing stored value.")
            cart_data[user_id]['total_price'] = calc_cat_total
            save_cart_data(cart_data)
            cart_total = calc_cat_total
        return cart_total
    except Exception as e:
        print(f"Error getting cart total for user {user_id}: {e}")
        return 0

def get_cart_summary(user_id):
    """Return a summary of the user's cart, including summary fields."""
    try:
        cart_data = load_cart_data()
        user_cart = cart_data.get(user_id, {})
        items = [
            {
                "item_id": item_id,
                "item_name": item.get('item_name', ''),
                "quantity": item.get('quantity', 0),
                "price_per_unit": item.get('price_per_unit', 0),
                "added_at": item.get('added_at', ''),
                "subtotal": item.get('quantity', 0) * item.get('price_per_unit', 0),
                "loyalty_points": item.get('loyalty_points', 0),
                "discount_given": item.get('discount_given', 0)
            }
            for item_id, item in user_cart.items()
            if not item_id.startswith('total_') and item_id not in ['food_saved', 'co2_reduced']
        ]
        summary = {
            "cart": items,
            "total": user_cart.get('total_price', 0),
            "total_after_discount": user_cart.get('total_price_after_discount', 0),
            "food_saved": user_cart.get('food_saved', 0),
            "co2_reduced": user_cart.get('co2_reduced', 0)
        }
        return summary
    except Exception as e:
        print(f"Error getting cart summary for user {user_id}: {e}")
        return {}

def load_loyalty_points(file_path=LOYALTY_FILE):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Convert to simple user: points mapping
            return {user: info.get("total_loyalty_points", 0) for user, info in data.items()}
    except (FileNotFoundError, json.JSONDecodeError, PermissionError) as e:
        print(f"Error loading loyalty points: {e}")
        return {}

def save_loyalty_points(points_data, file_path=LOYALTY_FILE):
    try:
        # Load the full impact_dash structure
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
        else:
            data = {}
        # Update only the loyalty points for each user
        for user, points in points_data.items():
            if user not in data:
                data[user] = {
                    "total_food_saved": 0,
                    "total_money_saved": 0,
                    "total_co2_reduced": 0,
                    "total_loyalty_points": 0,
                    "total_orders": 0,
                    "total_items": 0
                }
            data[user]["total_loyalty_points"] = points
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving loyalty points: {e}")
        raise

def add_loyalty_points(user_id, points):
    """
    Add loyalty points to a user in impact_dash.json (LOYALTY_FILE).
    """
    try:
        # Load the full impact_dash structure as a dict of dicts
        with open(LOYALTY_FILE, 'r') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    # Ensure user entry exists with all required fields
    if user_id not in data:
        data[user_id] = {
            "total_food_saved": 0,
            "total_money_saved": 0,
            "total_co2_reduced": 0,
            "total_loyalty_points": 0,
            "total_orders": 0,
            "total_items": 0
        }

    # Add points to the user's total_loyalty_points
    data[user_id]["total_loyalty_points"] = data[user_id].get("total_loyalty_points", 0) + points

    # Save back to file
    with open(LOYALTY_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    return data[user_id]["total_loyalty_points"]


def update_impact_dash(
    user_id,
    total_food_saved=0,
    total_money_saved=0,
    total_co2_reduced=0,
    total_loyalty_points=0,
    total_orders=0,
    total_items=0,
    file_path=LOYALTY_FILE
):
    """
    Update or create a user's impact dash entry with the provided values.
    Any parameter not given will default to 0.
    """
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
        else:
            data = {}

        # If user exists, update only the provided fields, else create new
        user_data = data.get(user_id, {
            "total_food_saved": 0,
            "total_money_saved": 0,
            "total_co2_reduced": 0,
            "total_loyalty_points": 0,
            "total_orders": 0,
            "total_items": 0
        })

        user_data["total_food_saved"] = total_food_saved
        user_data["total_money_saved"] = total_money_saved
        user_data["total_co2_reduced"] = total_co2_reduced
        user_data["total_loyalty_points"] = total_loyalty_points
        user_data["total_orders"] = total_orders
        user_data["total_items"] = total_items

        data[user_id] = user_data

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        return user_data
    except Exception as e:
        print(f"Error updating impact dash for user {user_id}: {e}")
        return None
    

def add_impact_dash(
    user_id,
    total_food_saved=0,
    total_money_saved=0,
    total_co2_reduced=0,
    total_loyalty_points=0,
    total_orders=0,
    total_items=0,
    file_path=LOYALTY_FILE
):
    """
    Incrementally add to a user's impact dash entry.
    If the user does not exist, create with the provided values (or 0).
    """
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
        else:
            data = {}

        # Get current values or default to 0
        user_data = data.get(user_id, {
            "total_food_saved": 0,
            "total_money_saved": 0,
            "total_co2_reduced": 0,
            "total_loyalty_points": 0,
            "total_orders": 0,
            "total_items": 0
        })

        user_data["total_food_saved"] += total_food_saved
        user_data["total_money_saved"] += total_money_saved
        user_data["total_co2_reduced"] += total_co2_reduced
        user_data["total_loyalty_points"] += total_loyalty_points
        user_data["total_orders"] += total_orders
        user_data["total_items"] += total_items

        data[user_id] = user_data

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        return user_data
    except Exception as e:
        print(f"Error adding to impact dash for user {user_id}: {e}")
        return None
    

def checkout_cart(user_id, points_earned=None, clear=True, loyalty_file=LOYALTY_FILE):
    """
    Checkout: totals cart price and loyalty points, shows summary, awards loyalty points, and optionally clears the cart.
    Returns a summary dict.
    """
    try:
        cart = get_cart(user_id)
        if not cart:
            return {"success": False, "message": "Cart is empty."}

        # Calculate total price and items
        total_price = sum(item['quantity'] * item['price_per_unit'] for item in cart.values())
        total_items = sum(item['quantity'] for item in cart.values())

        # Calculate points earned if not provided (1 point per item)
        if points_earned is None:
            points_earned = total_items

        # Award loyalty points
        add_loyalty_points(user_id, points_earned)

        # Get updated loyalty points
        loyalty_data = load_loyalty_points(loyalty_file)
        total_loyalty_points = loyalty_data.get(user_id, 0)

        summary = {
            "success": True,
            "message": "Checkout successful.",
            "cart_items": [
                {
                    "item_id": item_id,
                    "item_name": item['item_name'],
                    "quantity": item['quantity'],
                    "price_per_unit": item['price_per_unit'],
                    "subtotal": item['quantity'] * item['price_per_unit']
                }
                for item_id, item in cart.items()
            ],
            "total_price": total_price,
            "total_value": total_price,  # For frontend compatibility
            "loyalty_points": total_loyalty_points,
            "loyalty_points_earned": points_earned,
            "points_earned": points_earned,  # Alternative name for compatibility
            "total_items": total_items
        }

        if clear:
            clear_cart(user_id)

        return summary
    except Exception as e:
        return {"success": False, "message": f"Checkout error: {e}"}

def load_product_thresholds(file_path=THRESHOLD_FILE):
    """Load per-product expiry thresholds from JSON."""
    if not os.path.exists(file_path):
        return {}
    with open(file_path, 'r') as f:
        return json.load(f)

def get_product_thresholds(product_name, file_path=THRESHOLD_FILE):
    """Return thresholds for a product, or sensible defaults."""
    thresholds = load_product_thresholds(file_path)
    # Only min_days_for_cart is needed now
    return thresholds.get(product_name.lower(), {"min_days_for_cart": 3})

def days_until_expiry(expiry_date_str):
    """Return days until expiry from today."""
    expiry = datetime.fromisoformat(expiry_date_str)
    return (expiry.date() - datetime.now().date()).days

def find_best_item_for_cart(product_name, inventory_items, today=None, thresholds=None):
    """
    Find the freshest item for cart addition, respecting min_days_for_cart.
    Returns: (item, warning, incentive)
    """
    if today is None:
        today = datetime.now().date()
    if thresholds is None:
        thresholds = get_product_thresholds(product_name)
    min_days = thresholds["min_days_for_cart"]

    # Calculate days to expiry for each item
    items_with_days = [
        (item, days_until_expiry(item['expiry_date']))
        for item in inventory_items
    ]
    # Filter items with at least min_days left
    eligible = [t for t in items_with_days if t[1] >= min_days]
    if eligible:
        # Pick the one with max expiry (freshest)
        best = max(eligible, key=lambda t: t[1])
        return best[0], None, None
    else:
        # No eligible, pick freshest anyway, but warn and apply incentive
        best = max(items_with_days, key=lambda t: t[1])
        warning = f"Only near-expiry items available (expires in {best[1]} days)."
        incentive = {"discount": 0.2, "extra_points": 10}  # Example
        return best[0], warning, incentive

def find_near_expiry_replacements(product_name, inventory_items, today=None, thresholds=None):
    """
    Find all items with days_until_expiry < min_days_for_cart.
    Returns: list of enhanced items (dicts) with replacement metadata
    """
    if today is None:
        today = datetime.now().date()
    if thresholds is None:
        thresholds = get_product_thresholds(product_name)
    min_days = thresholds["min_days_for_cart"]
    
    replacements = []
    for item in inventory_items:
        days_left = days_until_expiry(item['expiry_date'])
        if 0 <= days_left < min_days:
            # Enhance replacement with additional metadata
            enhanced_item = item.copy()
            enhanced_item['days_until_expiry'] = days_left
            enhanced_item['replacement_type'] = 'near_expiry'
            
            # Add urgency level
            if days_left <= 1:
                enhanced_item['urgency_level'] = 'critical'
                enhanced_item['suggested_message'] = "Expires today or tomorrow - Buy only if you can use immediately"
            elif days_left <= 2:
                enhanced_item['urgency_level'] = 'critical'
                enhanced_item['suggested_message'] = "Expires within 2 days - Buy only if you can use it quickly"
            elif days_left <= 5:
                enhanced_item['urgency_level'] = 'warning'
                enhanced_item['suggested_message'] = "Expiring soon - Consider if you can use it within a few days"
            else:
                enhanced_item['urgency_level'] = 'low'
                enhanced_item['suggested_message'] = "Good alternative option"
            
            # Calculate effective discount
            max_discount = item.get('max_discount', 0)
            if days_left <= 1:
                enhanced_item['effective_discount'] = max_discount
            elif days_left <= 2:
                enhanced_item['effective_discount'] = max_discount * 0.8
            elif days_left <= 5:
                enhanced_item['effective_discount'] = max_discount * 0.5
            else:
                enhanced_item['effective_discount'] = 0
            
            # Calculate discounted price
            price = item.get('price_per_unit', 0)
            discount_percent = enhanced_item['effective_discount']
            enhanced_item['discounted_price'] = price * (1 - discount_percent / 100)
            
            # Mark as replacement
            enhanced_item['is_replacement'] = True
            
            replacements.append(enhanced_item)
    
    # Sort by urgency (critical first) then by days until expiry
    replacements.sort(key=lambda x: (x['urgency_level'] == 'critical', -x['days_until_expiry']))
    
    return replacements

def suggest_cart_and_replacements(product_name, inventory_items):
    """
    Main API: Suggest best item for cart and all near-expiry replacements.
    Returns: dict with 'best_item', 'warning', 'incentive', 'replacements'
    """
    thresholds = get_product_thresholds(product_name)
    best_item, warning, incentive = find_best_item_for_cart(product_name, inventory_items, thresholds=thresholds)
    replacements = find_near_expiry_replacements(product_name, inventory_items, thresholds=thresholds)
    return {
        "best_item": best_item,
        "warning": warning,
        "incentive": incentive,
        "replacements": replacements
    }

def get_inventory_items_for_product(product_name, inventory_file=None):
    """
    Fetch all inventory items for a given product_name from the Walmart inventory JSON.
    Returns a list of item dicts.
    """
    if inventory_file is None:
        inventory_file = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")
    if not os.path.exists(inventory_file):
        return []
    try:
        with open(inventory_file, 'r') as f:
            data = json.load(f)
        
        # Handle different JSON structures
        if isinstance(data, dict) and 'inventory' in data:
            inventory = data['inventory']
        elif isinstance(data, list):
            inventory = data
        else:
            print(f"Unexpected inventory structure: {type(data)}")
            return []
        
        # Normalize product name for case-insensitive match
        product_name_lower = product_name.lower()
        matching_items = [
            item for item in inventory
            if item.get("item_name", "").lower() == product_name_lower
        ]
        
        print(f"Found {len(matching_items)} items for product '{product_name}'")
        return matching_items
        
    except Exception as e:
        print(f"Error loading inventory for {product_name}: {e}")
        return []

def suggest_cart_and_replacements_auto(product_name):
    """
    Suggest best item and replacements for a product, fetching inventory automatically.
    """
    inventory_items = get_inventory_items_for_product(product_name)
    return suggest_cart_and_replacements(product_name, inventory_items)

