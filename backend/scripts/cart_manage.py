import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CART_FILE = os.path.join(BASE_DIR, "mock_api", "users_cart.json")
LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "loyalty_points.json")


def load_cart_data(file_path=CART_FILE):
    """
    Load cart data from JSON file.
    Returns an empty dict if the file does not exist or is invalid.
    """
    if not os.path.exists(file_path):
        return {}
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except json.JSONDecodeError:
        return {}

def save_cart_data(cart_data, file_path=CART_FILE):
    """
    Saves the provided cart data to a specified JSON file in an atomic and safe manner.
    This function serializes the `cart_data` dictionary to JSON and writes it to the file specified by `file_path`.
    To ensure data integrity, the function first writes the data to a temporary file in the same directory, and then
    atomically replaces the target file with the temporary file. If any error occurs during the process, the temporary
    file is removed and the exception is propagated.
    Parameters:
        cart_data (dict): The cart data to be saved. This should be a serializable Python dictionary.
        file_path (str, optional): The path to the file where the cart data should be saved. Defaults to CART_FILE.
    Raises:
        Exception: Propagates any exception that occurs during the file writing or replacement process.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    temp_file = file_path + ".tmp"
    try:
        with open(temp_file, 'w') as file:
            json.dump(cart_data, file, indent=2)
        os.replace(temp_file, file_path)
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise e

def add_item_to_cart(user_id, item_id, item_name, quantity, price_per_unit):
    """Add or update an item in a user's cart."""
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
    save_cart_data(cart_data)
    return {"success": True, "message": "Item added to cart."}


def remove_item_from_cart(user_id, item_id, quantity=None):
    """
    Remove an item or a specific quantity from a user's cart.
    If quantity is None or >= current, remove the item completely.
    """
    cart_data = load_cart_data()
    if user_id in cart_data and item_id in cart_data[user_id]:
        if quantity is None or quantity >= cart_data[user_id][item_id]['quantity']:
            del cart_data[user_id][item_id]
        else:
            cart_data[user_id][item_id]['quantity'] -= quantity
        if not cart_data[user_id]:
            del cart_data[user_id]
        save_cart_data(cart_data)
        return {"success": True, "message": "Item removed from cart."}
    return {"success": False, "message": "Item not found in cart."}

def clear_cart(user_id):
    """Clear all items from a user's cart but keep the user_id."""
    cart_data = load_cart_data()
    if user_id in cart_data:
        cart_data[user_id] = {}
        save_cart_data(cart_data)
        return {"success": True, "message": "Cart cleared."}
    return {"success": True, "message": "Cart already empty."}

def get_cart(user_id):
    """Return the user's cart as a dict."""
    cart_data = load_cart_data()
    return cart_data.get(user_id, {})

def get_cart_total(user_id):
    """Return the total price for the user's cart."""
    cart = get_cart(user_id)
    return sum(item['quantity'] * item['price_per_unit'] for item in cart.values())

def get_cart_summary(user_id):
    """Return a summary of the user's cart."""
    cart = get_cart(user_id)
    total = get_cart_total(user_id)
    items = [
        {
            "item_id": item_id,
            "item_name": item['item_name'],
            "quantity": item['quantity'],
            "price_per_unit": item['price_per_unit'],
            "added_at": item['added_at'],
            "subtotal": item['quantity'] * item['price_per_unit']
        }
        for item_id, item in cart.items()
    ]
    return {"cart": items, "total": total}

def load_loyalty_points(file_path=LOYALTY_FILE):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_loyalty_points(points_data, file_path=LOYALTY_FILE):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        json.dump(points_data, f, indent=2)

def add_loyalty_points(user_id, points):
    data = load_loyalty_points()
    data[user_id] = data.get(user_id, 0) + points
    save_loyalty_points(data)
    return data[user_id]

def checkout_cart(user_id, points_earned=None, clear=True, loyalty_file=LOYALTY_FILE):
    """
    Checkout: totals cart price and loyalty points, shows summary, awards loyalty points, and optionally clears the cart.
    Returns a summary dict.
    """
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