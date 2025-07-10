#!/usr/bin/env python3
"""
Test adding a replacement item to test_user's cart
"""
import json
import os
from datetime import datetime, timedelta

def add_discount_item_to_test_user():
    """Add a discounted replacement item to test_user's cart"""
    print("🛒 ADDING DISCOUNTED REPLACEMENT ITEM")
    print("=" * 45)
    
    # Load current cart
    cart_file = "backend/mock_api/users_cart.json"
    with open(cart_file, 'r') as f:
        cart_data = json.load(f)
    
    # Add a new discounted item to test_user
    new_item = {
        "item_id": "REPL001",
        "item_name": "Near-Expiry Cheese",
        "quantity": 2,
        "price_per_unit": 5.99,
        "discounted_price": 4.19,  # 30% discount
        "discount_given": 30.1,    # Calculated discount
        "category": "Dairy",
        "expiry_date": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
        "current_stock": 8,
        "max_discount": 35,
        "added_at": datetime.now().isoformat()
    }
    
    if "test_user" not in cart_data:
        cart_data["test_user"] = {
            "total_price": 0,
            "total_price_after_discount": 0,
            "food_saved": 0,
            "co2_reduced": 0
        }
    
    # Add the new item
    cart_data["test_user"]["REPL001"] = new_item
    
    # Update totals
    items = {k: v for k, v in cart_data["test_user"].items() 
             if not k.startswith('total_') and k not in ['food_saved', 'co2_reduced']}
    
    total_original = sum(item.get('quantity', 0) * item.get('price_per_unit', 0) for item in items.values())
    total_discounted = sum(item.get('quantity', 0) * item.get('discounted_price', item.get('price_per_unit', 0)) for item in items.values())
    
    cart_data["test_user"]["total_price"] = round(total_original, 2)
    cart_data["test_user"]["total_price_after_discount"] = round(total_discounted, 2)
    
    # Save back to file
    with open(cart_file, 'w') as f:
        json.dump(cart_data, f, indent=2)
    
    print(f"✅ Added '{new_item['item_name']}' to test_user's cart")
    print(f"   - Original Price: ${new_item['price_per_unit']:.2f}")
    print(f"   - Discounted Price: ${new_item['discounted_price']:.2f}")
    print(f"   - Discount: {new_item['discount_given']}%")
    print(f"   - Quantity: {new_item['quantity']}")
    print(f"   - Total Savings: ${(new_item['price_per_unit'] - new_item['discounted_price']) * new_item['quantity']:.2f}")
    
    print(f"\n📊 Cart Summary:")
    print(f"   - Total Original: ${total_original:.2f}")
    print(f"   - Total After Discount: ${total_discounted:.2f}")
    print(f"   - Total Savings: ${total_original - total_discounted:.2f}")

if __name__ == "__main__":
    add_discount_item_to_test_user()
