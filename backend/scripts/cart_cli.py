"""
User Cart Management Logic (Reusable)
-------------------------------------
Functions for cart operations, ready for CLI, API, or other integrations.
"""

import os
import sys
import json
from datetime import datetime

# Add current directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from cart_manage import (
        add_item_to_cart, remove_item_from_cart, clear_cart,
        get_cart_summary, get_cart, add_loyalty_points,
        load_loyalty_points, checkout_cart
    )
    CART_MANAGE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: cart_manage not available: {e}")
    CART_MANAGE_AVAILABLE = False

try:
    from replacement_utils import get_replacement_suggestions
    REPLACEMENT_UTILS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: replacement_utils not available: {e}")
    REPLACEMENT_UTILS_AVAILABLE = False
    
    def get_replacement_suggestions(item_name, threshold=5):
        return []

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_FILE = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")
LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "loyalty_points.json")

def load_inventory(file_path=INVENTORY_FILE):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return data["inventory"] if "inventory" in data else data
    except Exception as e:
        print(f"Error loading inventory: {e}")
        return []

def find_item_in_inventory(query):
    inventory = load_inventory()
    query = query.strip().lower()
    for item in inventory:
        if item['item_id'].lower() == query:
            return item
    matches = [item for item in inventory if query in item['item_name'].lower()]
    if matches:
        return matches[0]
    return None

def test_all_functions(user_id):
    print("\n--- Testing add_item_to_cart ---")
    inventory = load_inventory()
    if not inventory:
        print("No inventory found.")
        return
    test_item = inventory[0]
    print(add_item_to_cart(user_id, test_item['item_id'], test_item['item_name'], 2, test_item['price_per_unit']))

    print("\n--- Testing get_cart ---")
    print(get_cart(user_id))

    print("\n--- Testing get_cart_summary ---")
    print(get_cart_summary(user_id))

    print("\n--- Testing remove_item_from_cart (remove 1) ---")
    print(remove_item_from_cart(user_id, test_item['item_id'], 1))

    print("\n--- Testing get_cart after remove ---")
    print(get_cart(user_id))

    print("\n--- Testing clear_cart ---")
    print(clear_cart(user_id))

    print("\n--- Testing add_loyalty_points ---")
    print(add_loyalty_points(user_id, 10))
    print("Loyalty points:", load_loyalty_points().get(user_id, 0))

    print("\n--- Testing checkout_cart ---")
    # Add again for checkout
    add_item_to_cart(user_id, test_item['item_id'], test_item['item_name'], 1, test_item['price_per_unit'])
    print(checkout_cart(user_id, points_earned=0, loyalty_file=LOYALTY_FILE, clear=True))

if __name__ == "__main__":
    mode = "cli"
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        mode = "test"

    if mode == "test":
        print("FreshGuard User Cart CLI Tester")
        user_id = input("Enter user ID for testing: ").strip()
        test_all_functions(user_id)
        print("\nAll cart functions tested.")
    else:
        print("FreshGuard User Cart CLI")
        user_id = input("Enter user ID: ").strip()
        while True:
            cmd = input("\nEnter command (add/view/remove/clear/list/checkout/points/replace/exit): ").strip().lower()
            if cmd == "list":
                for item in load_inventory():
                    print(f"{item['item_id']}: {item['item_name']} (Stock: {item['current_stock']}, Price: ${item['price_per_unit']})")
            elif cmd == "add":
                item_query = input("Enter item name or ID to add: ").strip()
                quantity = int(input("Quantity: "))
                item = find_item_in_inventory(item_query)
                if not item:
                    print("Item not found in inventory.")
                    continue
                if quantity > item['current_stock']:
                    print("Not enough stock available.")
                    continue
                print(add_item_to_cart(user_id, item['item_id'], item['item_name'], quantity, item['price_per_unit']))
            elif cmd == "remove":
                item_id = input("Item ID to remove: ").strip()
                qty = input("Quantity to remove (leave blank for all): ").strip()
                qty = int(qty) if qty else None
                print(remove_item_from_cart(user_id, item_id, qty))
            elif cmd == "view":
                cart = get_cart_summary(user_id)
                print("Cart:", cart["cart"])
                print("Total:", cart["total"])
            elif cmd == "clear":
                print(clear_cart(user_id))
            elif cmd == "checkout":
                result = checkout_cart(user_id, points_earned=0, loyalty_file=LOYALTY_FILE, clear=True)
                if result["success"]:
                    print("\nCheckout Summary:")
                    for item in result["cart_items"]:
                        print(f"- {item['item_name']} (x{item['quantity']}): ${item['subtotal']:.2f}")
                    print(f"Total Price: ${result['total_price']:.2f}")
                    print(f"Loyalty Points: {result['loyalty_points']}")
                else:
                    print(result["message"])
            elif cmd == "points":
                points = load_loyalty_points().get(user_id, 0)
                print(f"Loyalty Points: {points}")
            elif cmd == "replace":
                item_query = input("Enter item name to get replacement suggestions: ").strip()
                suggestions = get_replacement_suggestions(item_query)
                if suggestions:
                    print("Replacement suggestions (near expiry):")
                    for s in suggestions:
                        print(f"- {s['item_name']} (ID: {s['item_id']}, Expires: {s['expiry_date']}, Days left: {s['days_until_expiry']}) - {s['suggested_message']}")
                else:
                    print("No near-expiry replacements found.")
            elif cmd == "exit":
                break
            else:
                print("Unknown command.")

def add_item_with_replacement(user_id, item_query, quantity):
    """Add item to cart with replacement suggestions if the item is near expiry."""
    try:
        # Find the item in inventory
        item = find_item_in_inventory(item_query)
        if not item:
            return {
                "success": False,
                "error": f"Item '{item_query}' not found in inventory"
            }
        
        # Check if cart_manage functions are available
        if not CART_MANAGE_AVAILABLE:
            return {
                "success": False,
                "error": "Cart management functions not available"
            }
        
        # Add item to cart
        result = add_item_to_cart(
            user_id=user_id,
            item_id=item['item_id'],
            item_name=item['item_name'],
            quantity=quantity,
            price_per_unit=item['price_per_unit']
        )
        
        if not result.get('success'):
            return result
        
        # Check if item is near expiry and provide replacement suggestions
        try:
            from datetime import datetime, timedelta
            expiry_date = datetime.strptime(item['expiry_date'], "%Y-%m-%d")
            today = datetime.today()
            days_left = (expiry_date - today).days
            
            if days_left <= 5:  # Near expiry
                replacements = []
                if REPLACEMENT_UTILS_AVAILABLE:
                    replacements = get_replacement_suggestions(item['item_name'])
                
                result['warning'] = f"Item expires in {days_left} days"
                result['replacements'] = replacements
                result['message'] = "Item added to cart. Consider fresher alternatives."
            else:
                result['message'] = "Item added to cart successfully"
        except Exception as e:
            # If date parsing fails, just add to cart without replacement suggestions
            result['message'] = "Item added to cart successfully"
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error adding item to cart: {str(e)}"
        }

def add_replacement_item(user_id, original_item_id, replacement_item, quantity):
    """Add a replacement item to cart and remove the original item."""
    try:
        if not CART_MANAGE_AVAILABLE:
            return {
                "success": False,
                "error": "Cart management functions not available"
            }
        
        # If replacement_item is a dict (full item info), use it directly
        if isinstance(replacement_item, dict):
            item = replacement_item
        else:
            # If it's a string, find the item in inventory
            item = find_item_in_inventory(replacement_item)
            if not item:
                return {
                    "success": False,
                    "error": f"Replacement item '{replacement_item}' not found"
                }
        
        # Remove the original item from the cart
        if original_item_id:
            remove_item_from_cart(user_id, original_item_id, quantity=None)  # Remove all quantity of original

        # Calculate discount for the replacement item
        discount = 0
        if 'expiry_date' in item:
            discount = calculate_discount(item['expiry_date'])

        result = add_item_to_cart(
            user_id=user_id,
            item_id=item['item_id'],
            item_name=item['item_name'],
            quantity=quantity,
            price_per_unit=item['price_per_unit'],
            discount_given=discount
        )
        
        if result.get('success'):
            result['message'] = "Replacement item added to cart successfully"
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error adding replacement item: {str(e)}"
        }

def calculate_discount(expiry_date, max_discount=50):
    """Calculate discount based on days until expiry."""
    try:
        from datetime import datetime
        expiry_dt = datetime.strptime(expiry_date, "%Y-%m-%d")
        today = datetime.today()
        days_left = (expiry_dt - today).days
        
        if days_left <= 0:
            return max_discount  # Max discount for expired items
        elif days_left <= 2:
            return max_discount * 0.8  # 80% of max discount
        elif days_left <= 5:
            return max_discount * 0.5  # 50% of max discount
        else:
            return 0  # No discount for fresh items
    except:
        return 0

def calculate_loyalty_points(cart):
    """Calculate loyalty points for cart items."""
    try:
        if isinstance(cart, dict):
            total_items = sum(item.get('quantity', 0) for item in cart.values())
        else:
            total_items = len(cart)
        return total_items  # 1 point per item
    except:
        return 0