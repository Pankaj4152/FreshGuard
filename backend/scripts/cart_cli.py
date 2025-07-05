"""
User Cart Management Logic (Reusable)
-------------------------------------
Functions for cart operations, ready for CLI, API, or other integrations.
"""

import os
import sys
import json
from datetime import datetime
from cart_manage import (
    add_item_to_cart, remove_item_from_cart, clear_cart,
    get_cart_summary, get_cart, add_loyalty_points,
    load_loyalty_points, checkout_cart
)
from replacement_utils import get_replacement_suggestions

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