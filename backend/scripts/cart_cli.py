"""
User Cart Management CLI
------------------------
A command-line interface to manage user carts for FreshGuard.
Allows adding, removing, viewing, and clearing items in a user's cart.
"""

import json
import os
from datetime import datetime
from cart_manage import add_item_to_cart, remove_item_from_cart, print_cart, load_cart_data, save_cart_data

# Dynamically determine the base directory (project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_FILE = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")

def load_inventory(file_path=INVENTORY_FILE):
    """Load inventory data from JSON file."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return data["inventory"] if "inventory" in data else data
    except Exception as e:
        print(f"Error loading inventory: {e}")
        return []

def list_inventory_items():
    """Print available items from inventory."""
    inventory = load_inventory()
    print("\nAvailable Items in Inventory:")
    for item in inventory:
        print(f"{item['item_id']}: {item['item_name']} (Stock: {item['current_stock']}, Price: ${item['price_per_unit']})")

def find_item_in_inventory(query):
    """
    Find an item in inventory by item_id or name (case-insensitive, partial match, with suggestions).
    """
    inventory = load_inventory()
    query = query.strip().lower()
    # First, try exact item_id match
    for item in inventory:
        if item['item_id'].lower() == query:
            return item
    # Then, try partial name match
    matches = [item for item in inventory if query in item['item_name'].lower()]
    if not matches:
        # Suggest similar items
        suggestions = [item for item in inventory if query[:2] in item['item_name'].lower()]
        if suggestions:
            print("No exact match found. Did you mean:")
            for idx, item in enumerate(suggestions, 1):
                print(f"{idx}. {item['item_id']}: {item['item_name']} (Stock: {item['current_stock']}, Price: ${item['price_per_unit']})")
        else:
            print("Item not found in inventory. Use 'list' to see all items.")
        return None
    if len(matches) == 1:
        return matches[0]
    print("Multiple items found:")
    for idx, item in enumerate(matches, 1):
        print(f"{idx}. {item['item_id']}: {item['item_name']} (Stock: {item['current_stock']}, Price: ${item['price_per_unit']})")
    try:
        choice = int(input("Select item number: "))
        return matches[choice - 1]
    except Exception:
        print("Invalid selection.")
        return None

def main():
    print("FreshGuard User Cart CLI")
    print("Commands: add, remove, view, clear, list, exit")
    user_id = input("Enter user ID: ").strip()
    while True:
        cmd = input("\nEnter command: ").strip().lower()
        if cmd == "list":
            list_inventory_items()
        elif cmd == "add":
            list_inventory_items()
            item_name = input("Enter item name to add: ").strip()
            item = find_item_in_inventory(item_name)
            if not item:
                print("Item not found in inventory.")
                continue
            if item['current_stock'] <= 0:
                print("Sorry, this item is out of stock.")
                continue
            try:
                quantity = int(input(f"Quantity (Available: {item['current_stock']}): "))
                if quantity <= 0:
                    print("Quantity must be positive.")
                    continue
                if quantity > item['current_stock']:
                    print("Not enough stock available.")
                    continue
            except ValueError:
                print("Invalid quantity.")
                continue
            add_item_to_cart(user_id, item['item_id'], item['item_name'], quantity, item['price_per_unit'])
            print("Item added to cart.")
        elif cmd == "remove":
            print_cart(user_id)
            item_id = input("Item ID to remove: ").strip()
            remove_item_from_cart(user_id, item_id)
            print("Item removed from cart.")
        elif cmd == "view":
            print_cart(user_id)
        elif cmd == "clear":
            cart_data = load_cart_data()
            if user_id in cart_data:
                del cart_data[user_id]
                save_cart_data(cart_data)
                print("Cart cleared.")
            else:
                print("Cart already empty.")
        elif cmd == "exit":
            print("Exiting CLI.")
            break
        else:
            print("Unknown command. Use add, remove, view, clear, list, or exit.")

if __name__ == "__main__":
    main()