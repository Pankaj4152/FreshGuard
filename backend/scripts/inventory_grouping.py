"""
Inventory Grouping and Smart Product Selection
============================================
This module handles grouping similar products and implementing smart replacement logic.
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_FILE = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")

def load_inventory(file_path=INVENTORY_FILE):
    """Load inventory from JSON file."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return data["inventory"] if "inventory" in data else data
    except Exception as e:
        print(f"Error loading inventory: {e}")
        return []

def get_days_until_expiry(expiry_date_str):
    """Calculate days until expiry from date string."""
    try:
        expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d")
        today = datetime.now()
        return (expiry_date - today).days
    except:
        return 999  # Default to far future if date parsing fails

def group_inventory_by_product(inventory=None, near_expiry_threshold=5):
    """
    Group inventory items by product name and separate fresh vs near-expiry items.
    
    Args:
        inventory: List of inventory items. If None, loads from file.
        near_expiry_threshold: Days threshold for considering items as near-expiry
    
    Returns:
        dict: {
            'grouped_products': {
                'product_name': {
                    'fresh_items': [items with >threshold days],
                    'near_expiry_items': [items with <=threshold days],
                    'best_item': item_with_latest_expiry,
                    'display_info': {product_display_information}
                }
            },
            'all_grouped': [list of display products for UI]
        }
    """
    if inventory is None:
        inventory = load_inventory()
    
    # Group by product name
    product_groups = defaultdict(list)
    for item in inventory:
        if item.get('current_stock', 0) > 0:  # Only include items in stock
            product_groups[item['item_name']].append(item)
    
    grouped_products = {}
    all_grouped = []
    
    for product_name, items in product_groups.items():
        # Sort items by expiry date (freshest first)
        items.sort(key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d"), reverse=True)
        
        # Separate fresh and near-expiry items
        fresh_items = []
        near_expiry_items = []
        
        for item in items:
            days_until_expiry = get_days_until_expiry(item['expiry_date'])
            if days_until_expiry <= near_expiry_threshold:
                near_expiry_items.append(item)
            else:
                fresh_items.append(item)
        
        # Get the best (freshest) item for default selection
        best_item = fresh_items[0] if fresh_items else items[0]
        
        # Calculate total stock
        total_stock = sum(item['current_stock'] for item in items)
        
        # Calculate average price (weighted by stock)
        total_weighted_price = sum(item['price_per_unit'] * item['current_stock'] for item in items)
        avg_price = total_weighted_price / total_stock if total_stock > 0 else 0
        
        # Create display information
        display_info = {
            'item_id': f"GROUPED_{product_name.replace(' ', '_').upper()}",
            'item_name': product_name,
            'category': best_item['category'],
            'price_per_unit': best_item['price_per_unit'],
            'current_stock': total_stock,
            'expiry_date': best_item['expiry_date'],
            'storage_type': best_item['storage_type'],
            'arrival_date': best_item['arrival_date'],
            'shelf_life_days': best_item['shelf_life_days'],
            'discount': best_item.get('max_discount', 0),
            'effective_discount': best_item.get('effective_discount', 0),
            'discounted_price': best_item.get('discounted_price', best_item['price_per_unit']),
            
            # Additional grouping info
            'total_variants': len(items),
            'has_near_expiry': len(near_expiry_items) > 0,
            'near_expiry_count': len(near_expiry_items),
            'fresh_count': len(fresh_items),
            'price_range': {
                'min': min(item['price_per_unit'] for item in items),
                'max': max(item['price_per_unit'] for item in items)
            }
        }
        
        grouped_products[product_name] = {
            'fresh_items': fresh_items,
            'near_expiry_items': near_expiry_items,
            'best_item': best_item,
            'display_info': display_info,
            'all_items': items
        }
        
        all_grouped.append(display_info)
    
    return {
        'grouped_products': grouped_products,
        'all_grouped': all_grouped
    }

def find_freshest_item(product_name, inventory=None, min_days_threshold=3):
    """
    Find the freshest available item for a given product name.
    
    Args:
        product_name: Name of the product to find
        inventory: List of inventory items. If None, loads from file.
        min_days_threshold: Minimum days until expiry to be considered safe
    
    Returns:
        dict: Best item that meets the threshold, or None if none available
    """
    if inventory is None:
        inventory = load_inventory()
    
    # Find all items with the same name and in stock
    matching_items = [
        item for item in inventory 
        if item['item_name'].lower() == product_name.lower() 
        and item.get('current_stock', 0) > 0
    ]
    
    if not matching_items:
        return None
    
    # Filter items that meet the minimum threshold
    safe_items = [
        item for item in matching_items 
        if get_days_until_expiry(item['expiry_date']) >= min_days_threshold
    ]
    
    # If no safe items, return the freshest available
    items_to_consider = safe_items if safe_items else matching_items
    
    # Sort by expiry date (freshest first)
    items_to_consider.sort(
        key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d"), 
        reverse=True
    )
    
    return items_to_consider[0]

def find_near_expiry_replacements(product_name, inventory=None, near_expiry_threshold=5):
    """
    Find near-expiry replacements for a given product name.
    
    Args:
        product_name: Name of the product to find replacements for
        inventory: List of inventory items. If None, loads from file.
        near_expiry_threshold: Days threshold for considering items as near-expiry
    
    Returns:
        list: List of near-expiry items that can be used as replacements
    """
    if inventory is None:
        inventory = load_inventory()
    
    # Find all items with the same name and in stock
    matching_items = [
        item for item in inventory 
        if item['item_name'].lower() == product_name.lower() 
        and item.get('current_stock', 0) > 0
    ]
    
    # Filter to only near-expiry items
    near_expiry_items = [
        item for item in matching_items 
        if get_days_until_expiry(item['expiry_date']) <= near_expiry_threshold
    ]
    
    # Sort by expiry date (nearest expiry first)
    near_expiry_items.sort(
        key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d")
    )
    
    return near_expiry_items

def get_product_summary(product_name, inventory=None):
    """
    Get a summary of all variants of a product.
    
    Args:
        product_name: Name of the product
        inventory: List of inventory items. If None, loads from file.
    
    Returns:
        dict: Summary information about the product variants
    """
    if inventory is None:
        inventory = load_inventory()
    
    # Find all items with the same name
    matching_items = [
        item for item in inventory 
        if item['item_name'].lower() == product_name.lower()
    ]
    
    if not matching_items:
        return None
    
    in_stock_items = [item for item in matching_items if item.get('current_stock', 0) > 0]
    
    return {
        'product_name': product_name,
        'total_variants': len(matching_items),
        'in_stock_variants': len(in_stock_items),
        'total_stock': sum(item['current_stock'] for item in in_stock_items),
        'price_range': {
            'min': min(item['price_per_unit'] for item in in_stock_items) if in_stock_items else 0,
            'max': max(item['price_per_unit'] for item in in_stock_items) if in_stock_items else 0
        },
        'expiry_range': {
            'earliest': min(item['expiry_date'] for item in in_stock_items) if in_stock_items else None,
            'latest': max(item['expiry_date'] for item in in_stock_items) if in_stock_items else None
        },
        'has_near_expiry': any(
            get_days_until_expiry(item['expiry_date']) <= 5 
            for item in in_stock_items
        ),
        'all_items': matching_items,
        'in_stock_items': in_stock_items
    }

# Test functions
if __name__ == "__main__":
    # Test the grouping functionality
    print("Testing inventory grouping...")
    
    grouped_data = group_inventory_by_product()
    print(f"Found {len(grouped_data['all_grouped'])} unique products")
    
    # Show some examples
    for i, product in enumerate(grouped_data['all_grouped'][:5]):
        print(f"{i+1}. {product['item_name']} - {product['total_variants']} variants")
        if product['has_near_expiry']:
            print(f"   Has {product['near_expiry_count']} near-expiry items")
    
    # Test finding freshest item
    print("\nTesting freshest item selection...")
    freshest = find_freshest_item("Cheese")
    if freshest:
        print(f"Freshest Cheese: {freshest['item_id']} expires {freshest['expiry_date']}")
    
    # Test finding replacements
    print("\nTesting replacement finding...")
    replacements = find_near_expiry_replacements("Cheese")
    if replacements:
        print(f"Found {len(replacements)} near-expiry Cheese replacements")
        for rep in replacements[:3]:
            print(f"  - {rep['item_id']} expires {rep['expiry_date']} ({get_days_until_expiry(rep['expiry_date'])} days)")
