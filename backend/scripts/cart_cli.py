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
from replacement_utils import find_nearest_expiry_item
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
    inventory = load_inventory()
    query = query.strip().lower()
    for item in inventory:
        if item['item_id'].lower() == query:
            return item
    matches = [item for item in inventory if query in item['item_name'].lower()]
    if len(matches) == 1:
        return matches[0]
    return matches  # Return list for suggestions or empty list

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
    item = find_item_in_inventory(item_query)
    if isinstance(item, list):
        if not item:
            return {"success": False, "message": "Item not found in inventory."}
        return {"success": False, "message": "Multiple items found.", "suggestions": item}
    if not item:
        return {"success": False, "message": "Item not found in inventory."}
    if item['current_stock'] <= 0:
        return {"success": False, "message": "Sorry, this item is out of stock."}

    replacement = find_nearest_expiry_item(item['item_name'])
    if replacement and replacement['item_id'] != item['item_id']:
        return {
            "success": False,
            "message": "A near-expiry replacement is available.",
            "replacement": replacement,
            "original": item
        }

    max_discount = item.get('discount', 0)
    effective_discount = calculate_discount(item['expiry_date'], max_discount)
    discounted_price = item['price_per_unit'] * (1 - effective_discount / 100)

    if quantity <= 0:
        return {"success": False, "message": "Quantity must be positive."}
    if quantity > item['current_stock']:
        return {"success": False, "message": "Not enough stock available."}

    # For regular item
    points = calculate_loyalty_points(item, is_replacement=False, quantity=quantity)
    add_loyalty_points(user_id, points)

    add_item_to_cart(user_id, item['item_id'], item['item_name'], quantity, discounted_price)
    return {
        "success": True,
        "message": "Item added to cart.",
        "item_id": item['item_id'],
        "item_name": item['item_name'],
        "quantity": quantity,
        "price_per_unit": discounted_price,
        "discount_applied": effective_discount,
        "loyalty_points_earned": points,
        "total_loyalty_points": load_loyalty_points().get(user_id, 0)
    }

def add_replacement_item(user_id, replacement, quantity):
    max_discount = replacement.get('discount', 0)
    effective_discount = calculate_discount(replacement['expiry_date'], max_discount)
    discounted_price = replacement['price_per_unit'] * (1 - effective_discount / 100)
    if quantity <= 0:
        return {"success": False, "message": "Quantity must be positive."}
    if quantity > replacement['current_stock']:
        return {"success": False, "message": "Not enough stock available."}
    # For replacement item
    points = calculate_loyalty_points(replacement, is_replacement=True, quantity=quantity)
    add_loyalty_points(user_id, points)
    add_item_to_cart(user_id, replacement['item_id'], replacement['item_name'], quantity, discounted_price)
    return {
        "success": True,
        "message": "Replacement item added to cart.",
        "item_id": replacement['item_id'],
        "item_name": replacement['item_name'],
        "quantity": quantity,
        "price_per_unit": discounted_price,
        "discount_applied": effective_discount,
        "loyalty_points_earned": points,
        "total_loyalty_points": load_loyalty_points().get(user_id, 0)
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