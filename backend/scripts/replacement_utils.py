from cart_manage import *
import json
import os
from datetime import datetime




def scan_inventory(added_item, inventory_path):
    """scans inventory for the item and returns the item if found, else None"""


    try:
        with open(inventory_path, 'r') as file:
            inventory = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

    for item in inventory.get('items', []):
        if item['item_name'].lower() == added_item.lower():
            return item
    return None

def find_nearest_expiry_item(item_name, inventory_path=None):
    """
    Scan inventory for all items with the given name and return the one with the nearest expiry date (and in stock).
    Returns the item dict or None if not found.
    """
    # Dynamically determine the inventory path if not provided
    if inventory_path is None:
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        inventory_path = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")

    try:
        with open(inventory_path, 'r') as file:
            inventory = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

    items = inventory.get('inventory', [])

    matching_items = [
        item for item in items
        if item['item_name'].lower() == item_name.lower() and item.get('current_stock', 0) > 0
    ]
    if not matching_items:
        return None

    nearest_item = min(
        matching_items,
        key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d")
    )
    return nearest_item

# Example usage:
if __name__ == "__main__":
    nearest = find_nearest_expiry_item("Pork")
    if nearest:
        print("Nearest expiring item:", nearest)    
    else:
        print("No matching item found in inventory.")