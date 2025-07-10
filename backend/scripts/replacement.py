import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_FILE = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")
THRESHOLD_FILE = os.path.join(BASE_DIR, "mock_api", "product_thresholds.json")

def load_product_thresholds(file_path=THRESHOLD_FILE):
    """Load per-product expiry thresholds from JSON."""
    if not os.path.exists(file_path):
        return {}
    with open(file_path, 'r') as f:
        return json.load(f)

def get_product_thresholds(product_name, file_path=THRESHOLD_FILE):
    """Return thresholds for a product, or sensible defaults."""
    thresholds = load_product_thresholds(file_path)
    return thresholds.get(product_name.lower(), {"min_days_for_cart": 3})

def days_until_expiry(expiry_date_str):
    """Return days until expiry from today."""
    expiry = datetime.fromisoformat(expiry_date_str)
    return (expiry.date() - datetime.now().date()).days

def get_inventory_items_for_product(product_name, inventory_file=INVENTORY_FILE):
    """
    Fetch all inventory items for a given product_name from the Walmart inventory JSON.
    Returns a list of item dicts.
    """
    if not os.path.exists(inventory_file):
        return []
    try:
        with open(inventory_file, 'r') as f:
            data = json.load(f)
        # Support both {"inventory": [...]} and flat list
        inventory = data["inventory"] if "inventory" in data else data
        product_name_lower = product_name.lower()
        return [
            item for item in inventory
            if item.get("item_name", "").lower() == product_name_lower
        ]
    except Exception as e:
        print(f"Error loading inventory for {product_name}: {e}")
        return []

def find_best_item_for_cart(product_name, today=None):
    """
    Find the best item to add to cart for a product.
    Returns: dict with best_item, warning, incentive.
    """
    inventory_items = get_inventory_items_for_product(product_name)
    if not inventory_items:
        return {"best_item": None, "warning": "No inventory found.", "incentive": None}

    thresholds = get_product_thresholds(product_name)
    min_days = thresholds["min_days_for_cart"]
    if today is None:
        today = datetime.now().date()

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
        return {"best_item": best[0], "warning": None, "incentive": None}
    else:
        # No eligible, pick freshest anyway, but warn and apply incentive
        best = max(items_with_days, key=lambda t: t[1])
        warning = f"Only near-expiry items available (expires in {best[1]} days)."
        incentive = f"Save 20% + earn 10 bonus points with near-expiry items!"
        return {"best_item": best[0], "warning": warning, "incentive": incentive}

def find_near_expiry_replacements(product_name, today=None):
    """
    Find all items with days_until_expiry < min_days_for_cart.
    Returns: list of items (dicts)
    """
    inventory_items = get_inventory_items_for_product(product_name)
    thresholds = get_product_thresholds(product_name)
    min_days = thresholds["min_days_for_cart"]
    if today is None:
        today = datetime.now().date()
    return [
        item for item in inventory_items
        if 0 <= days_until_expiry(item['expiry_date']) < min_days
    ]

def suggest_cart_and_replacements(product_name):
    """
    Main API: Suggest best item for cart and all near-expiry replacements.
    Returns: dict with 'best_item', 'warning', 'incentive', 'replacements'
    """
    best = find_best_item_for_cart(product_name)
    replacements = find_near_expiry_replacements(product_name)
    # Remove best_item from replacements if present
    best_id = best["best_item"].get("item_id") if best["best_item"] else None
    replacements = [
        item for item in replacements
        if item.get("item_id") != best_id
    ]
    return {
        "best_item": best["best_item"],
        "warning": best["warning"],
        "incentive": best["incentive"],
        "replacements": replacements
    }

