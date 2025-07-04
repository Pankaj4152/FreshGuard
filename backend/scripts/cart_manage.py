import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CART_FILE = os.path.join(BASE_DIR, "mock_api", "users_cart.json")

"""
To-do:
1. should be like if cart json not found handle that also
   - create a new cart json file
   - and load it or save it when adding or removing items
2. can remove a specific quantity of an item
3. when clear cart does not remove userid just clears the items

"""
def load_cart_data(file_path=CART_FILE):
    """Load cart data from JSON file."""
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_cart_data(cart_data, file_path=CART_FILE):
    """Save cart data to JSON file."""
    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as file:
        json.dump(cart_data, file, indent=2)

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

def remove_item_from_cart(user_id, item_id):
    """Remove an item from a user's cart."""
    cart_data = load_cart_data()
    if user_id in cart_data and item_id in cart_data[user_id]:
        del cart_data[user_id][item_id]
        if not cart_data[user_id]:
            del cart_data[user_id]
    save_cart_data(cart_data)

def print_cart(user_id):
    """Print the current items in a user's cart."""
    cart_data = load_cart_data()
    if user_id not in cart_data or not cart_data[user_id]:
        print(f"Cart for user {user_id} is empty.")
        return
    print(f"Current Cart Items for user {user_id}:")
    for item_id, item in cart_data[user_id].items():
        print(f"Item ID: {item_id}, Name: {item['item_name']}, Quantity: {item['quantity']}, "
              f"Price per Unit: ${item['price_per_unit']:.2f}, Added at: {item['added_at']}")
    total = sum(item['quantity'] * item['price_per_unit'] for item in cart_data[user_id].values())
    print(f"Total Price: ${total:.2f}")



# Example usage:
if __name__ == "__main__":
    user_id = "user101"
    add_item_to_cart(user_id, "ITEM1005", "Juice", 2, 3.49)
    add_item_to_cart(user_id, "ITEM1001", "Apple", 4, 0.99)
    print_cart(user_id)
    remove_item_from_cart(user_id, "ITEM1001")
    print_cart(user_id)