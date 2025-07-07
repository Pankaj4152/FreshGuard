#!/usr/bin/env python3
"""
Add items to cart for testing
"""
import sys
import os
import json

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from scripts.cart_manage import add_item_to_cart

def add_test_items():
    """Add test items to cart"""
    print("🛒 Adding test items to cart...")
    
    # Add beef to cart
    result1 = add_item_to_cart("user1", "ITEM0027", "Beef", 1, 8.99)
    print(f"Added beef: {result1}")
    
    # Add cheese to cart
    result2 = add_item_to_cart("user1", "ITEM0015", "Cheese", 2, 4.50)
    print(f"Added cheese: {result2}")
    
    # Add apple to cart
    result3 = add_item_to_cart("user1", "ITEM0003", "Apple", 3, 2.00)
    print(f"Added apple: {result3}")
    
    print("✅ Items added to cart successfully!")

if __name__ == "__main__":
    add_test_items()
