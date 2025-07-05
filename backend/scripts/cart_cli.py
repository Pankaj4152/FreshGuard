"""
User Cart Management Logic (Reusable)
-------------------------------------
Functions for cart operations, ready for CLI, API, or other integrations.
"""

import os
from datetime import datetime
from cart_manage import (
    add_item_to_cart, remove_item_from_cart, clear_cart,
    get_cart_summary, load_cart_data, save_cart_data,
    load_loyalty_points, save_loyalty_points, add_loyalty_points,
    checkout_cart
)
from replacement_utils import (
    find_nearest_expiry_item, 
    find_best_item_for_cart, 
    get_replacement_suggestions
)
from inventory_grouping import get_days_until_expiry
import json

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
    """
    Find item in inventory by ID or name.
    Now uses intelligent selection for product names - returns the best available item.
    """
    inventory = load_inventory()
    query = query.strip().lower()
    
    # First, try to find by exact item_id
    for item in inventory:
        if item['item_id'].lower() == query:
            return item
    
    # Try to find by product name using intelligent selection
    try:
        from inventory_grouping import find_freshest_item
        best_item = find_freshest_item(query, inventory, min_days_threshold=3)
        if best_item:
            return best_item
    except ImportError:
        pass
    
    # Fallback: find matches by name
    matches = [item for item in inventory if query in item['item_name'].lower()]
    if len(matches) == 1:
        return matches[0]
    elif len(matches) > 1:
        # For multiple matches, return the one with the latest expiry date
        try:
            from datetime import datetime
            best_match = max(matches, key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d"))
            return best_match
        except:
            return matches[0]  # Fallback to first match
    
    return None  # No matches found

def calculate_discount(expiry_date_str, max_discount, today=None):
    if today is None:
        today = datetime.today()
    expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d")
    days_left = (expiry_date - today).days
    if days_left <= 2:
        discount = 50
    elif days_left <= 5:
        discount = 30
    elif days_left <= 10:
        discount = 15
    else:
        discount = 0
    return min(discount, max_discount)

def calculate_loyalty_points(item, is_replacement=False, quantity=1):
    """
    Returns loyalty points for an item.
    - 10 points per replacement item (near-expiry accepted)
    - 1 point per regular item
    """
    if is_replacement:
        return 10 * quantity
    return 1 * quantity

def add_item_with_replacement(user_id, item_query, quantity):
    """
    Add item to cart with intelligent replacement suggestions.
    
    This function now:
    1. Finds the best (freshest) item that meets safety threshold by default
    2. Only suggests near-expiry items as replacements (not fresher alternatives)
    3. Ensures no items with <3 days expiry are added unless user explicitly chooses them
    """
    # Try to find the item using intelligent selection
    item = find_item_in_inventory(item_query)
    
    if not item:
        return {"success": False, "message": "Item not found in inventory."}
    
    if item['current_stock'] <= 0:
        return {"success": False, "message": "Sorry, this item is out of stock."}

    # Find the best item to add to cart (freshest with safety threshold)
    try:
        best_item = find_best_item_for_cart(item['item_name'], min_days_threshold=3)
        if not best_item:
            # If no safe items available, use the original item
            best_item = item
    except:
        # Fallback if grouping functions not available
        best_item = item

    # Check if there are near-expiry replacements available
    try:
        replacement_suggestions = get_replacement_suggestions(item['item_name'], near_expiry_threshold=5)
        
        # If we have near-expiry options, offer them as replacements
        if replacement_suggestions:
            return {
                "success": False,
                "message": "Near-expiry alternatives available with discount and loyalty points.",
                "replacement": replacement_suggestions[0],  # Best near-expiry option
                "all_replacements": replacement_suggestions,
                "original": best_item  # The fresh item we would add by default
            }
    except:
        # Fallback if replacement functions not available
        pass

    # No replacements, add the best available item
    max_discount = best_item.get('discount', 0)
    effective_discount = calculate_discount(best_item['expiry_date'], max_discount)
    discounted_price = best_item['price_per_unit'] * (1 - effective_discount / 100)

    if quantity <= 0:
        return {"success": False, "message": "Quantity must be positive."}
    if quantity > best_item['current_stock']:
        return {"success": False, "message": "Not enough stock available."}

    # For regular item (freshest available)
    points = calculate_loyalty_points(best_item, is_replacement=False, quantity=quantity)
    add_loyalty_points(user_id, points)

    add_item_to_cart(user_id, best_item['item_id'], best_item['item_name'], quantity, discounted_price)
    
    try:
        days_until_expiry = get_days_until_expiry(best_item['expiry_date'])
    except:
        # Fallback if function not available
        from datetime import datetime
        try:
            expiry_date = datetime.strptime(best_item['expiry_date'], "%Y-%m-%d")
            today = datetime.now()
            days_until_expiry = (expiry_date - today).days
        except:
            days_until_expiry = 999
    
    return {
        "success": True,
        "message": f"Fresh {best_item['item_name']} added to cart (expires in {days_until_expiry} days).",
        "item_id": best_item['item_id'],
        "item_name": best_item['item_name'],
        "quantity": quantity,
        "price_per_unit": discounted_price,
        "discount_applied": effective_discount,
        "loyalty_points_earned": points,
        "total_loyalty_points": load_loyalty_points().get(user_id, 0),
        "days_until_expiry": days_until_expiry,
        "selection_type": "fresh_item"
    }

def add_replacement_item(user_id, replacement, quantity):
    """
    Add a replacement item (near-expiry) to cart with bonus loyalty points.
    
    Args:
        user_id: User ID
        replacement: The replacement item (near-expiry item)
        quantity: Quantity to add
    """
    max_discount = replacement.get('discount', 0)
    effective_discount = calculate_discount(replacement['expiry_date'], max_discount)
    discounted_price = replacement['price_per_unit'] * (1 - effective_discount / 100)
    
    if quantity <= 0:
        return {"success": False, "message": "Quantity must be positive."}
    if quantity > replacement['current_stock']:
        return {"success": False, "message": "Not enough stock available."}
    
    # For replacement item (near-expiry) - bonus loyalty points
    points = calculate_loyalty_points(replacement, is_replacement=True, quantity=quantity)
    add_loyalty_points(user_id, points)
    
    add_item_to_cart(user_id, replacement['item_id'], replacement['item_name'], quantity, discounted_price)
    
    try:
        days_until_expiry = get_days_until_expiry(replacement['expiry_date'])
    except:
        # Fallback if function not available
        from datetime import datetime
        try:
            expiry_date = datetime.strptime(replacement['expiry_date'], "%Y-%m-%d")
            today = datetime.now()
            days_until_expiry = (expiry_date - today).days
        except:
            days_until_expiry = 999
    
    return {
        "success": True,
        "message": f"Replacement {replacement['item_name']} added to cart with {points} bonus loyalty points! (expires in {days_until_expiry} days)",
        "item_id": replacement['item_id'],
        "item_name": replacement['item_name'],
        "quantity": quantity,
        "price_per_unit": discounted_price,
        "discount_applied": effective_discount,
        "loyalty_points_earned": points,
        "total_loyalty_points": load_loyalty_points().get(user_id, 0),
        "days_until_expiry": days_until_expiry,
        "selection_type": "replacement_item",
        "replacement_bonus": True
    }

# CLI entry point for manual testing (optional)
if __name__ == "__main__":
    print("FreshGuard User Cart CLI (Function-based)")
    user_id = input("Enter user ID: ").strip()
    while True:
        cmd = input("\nEnter command (add/view/remove/clear/list/checkout/exit): ").strip().lower()
        if cmd == "list":
            for item in load_inventory():
                print(f"{item['item_id']}: {item['item_name']} (Stock: {item['current_stock']}, Price: ${item['price_per_unit']})")
        elif cmd == "add":
            item_query = input("Enter item name or ID to add: ").strip()
            quantity = int(input("Quantity: "))
            result = add_item_with_replacement(user_id, item_query, quantity)
            if result.get("suggestions"):
                print("Multiple items found:")
                for idx, item in enumerate(result["suggestions"], 1):
                    print(f"{idx}. {item['item_id']}: {item['item_name']} (Stock: {item['current_stock']})")
            elif result.get("replacement"):
                rep = result["replacement"]
                # Show discount and loyalty points for replacement
                rep_discount = calculate_discount(rep['expiry_date'], rep.get('discount', 0))
                rep_loyalty = calculate_loyalty_points(rep, is_replacement=True, quantity=quantity)
                print(f"Replacement available: {rep['item_id']} ({rep['item_name']}, Expiry: {rep['expiry_date']})")
                print(f"Discount on replacement: {rep_discount}%")
                print(f"Loyalty points if accepted: {rep_loyalty}")
                choice = input("Add replacement instead? (yes/no): ").strip().lower()
                if choice in ("yes", "y"):
                    print(add_replacement_item(user_id, rep, quantity))
                else:
                    print(add_item_with_replacement(user_id, result["original"]['item_id'], quantity))
            else:
                print(result["message"])
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
        elif cmd == "exit":
            break
        else:
            print("Unknown command.")