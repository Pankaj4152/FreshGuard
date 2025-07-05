from cart_manage import *
import json
import os
from datetime import datetime
from inventory_grouping import (
    find_freshest_item, 
    find_near_expiry_replacements, 
    get_days_until_expiry,
    load_inventory
)

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
    DEPRECATED: Use find_near_expiry_replacements from inventory_grouping instead.
    
    This function is kept for backward compatibility but now uses the new
    intelligent replacement logic that only suggests near-expiry items.
    """
    # Get near-expiry replacements (items expiring within 5 days)
    replacements = find_near_expiry_replacements(item_name, near_expiry_threshold=5)
    
    # Return the nearest expiring replacement, or None if no near-expiry items
    return replacements[0] if replacements else None

def find_best_item_for_cart(item_name, min_days_threshold=3):
    """
    Find the best item to add to cart by default.
    
    Args:
        item_name: Name of the product
        min_days_threshold: Minimum days until expiry to be considered safe
    
    Returns:
        dict: Best item that meets safety threshold, or freshest available
    """
    return find_freshest_item(item_name, min_days_threshold=min_days_threshold)

def get_replacement_suggestions(item_name, near_expiry_threshold=5):
    """
    Get replacement suggestions for a product - only near-expiry items.
    
    Args:
        item_name: Name of the product
        near_expiry_threshold: Days threshold for near-expiry consideration
    
    Returns:
        list: List of near-expiry replacement options with additional info
    """
    replacements = find_near_expiry_replacements(item_name, near_expiry_threshold=near_expiry_threshold)
    
    # Add additional information for each replacement
    enhanced_replacements = []
    for replacement in replacements:
        days_until_expiry = get_days_until_expiry(replacement['expiry_date'])
        
        # Add replacement-specific information
        replacement_info = replacement.copy()
        replacement_info.update({
            'days_until_expiry': days_until_expiry,
            'replacement_type': 'near_expiry',
            'urgency_level': 'critical' if days_until_expiry <= 2 else 'warning',
            'suggested_message': get_replacement_message(days_until_expiry),
            'is_replacement': True
        })
        
        enhanced_replacements.append(replacement_info)
    
    return enhanced_replacements

def get_replacement_message(days_until_expiry):
    """Generate appropriate message for replacement suggestions."""
    if days_until_expiry <= 1:
        return "Expires today or tomorrow - Buy only if you can use immediately"
    elif days_until_expiry <= 2:
        return "Expires within 2 days - Buy only if you can use it quickly"
    elif days_until_expiry <= 5:
        return "Expiring soon - Consider if you can use it within a few days"
    else:
        return "Good alternative option"

# Example usage:
if __name__ == "__main__":
    nearest = find_nearest_expiry_item("Pork")
    if nearest:
        print("Nearest expiring item:", nearest)    
    else:
        print("No matching item found in inventory.")