#!/usr/bin/env python3
"""
Debug tool to test if replacement suggestions are working.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def debug_replacement_suggestions():
    """Debug why replacement modal might not be showing."""
    print("🔍 DEBUGGING REPLACEMENT SUGGESTIONS...")
    print("=" * 50)
    
    user_id = "test_user_debug"
    
    # 1. Clear cart
    print("1. Clearing cart...")
    clear_response = requests.post(f"{BASE_URL}/clear_cart", 
                                 json={"user_id": user_id})
    print(f"   Clear success: {clear_response.json().get('success', False)}")
    
    # 2. Test with an item that should definitely have replacements
    items_to_test = [
        "Cheese",    # Should have near-expiry items
        "Yogurt",    # Should have near-expiry items  
        "Milk",      # Common item
        "Banana"     # Common produce item
    ]
    
    for item_name in items_to_test:
        print(f"\n2. Testing with '{item_name}'...")
        
        # Add to cart
        add_response = requests.post(f"{BASE_URL}/add_to_cart",
                                   json={
                                       "user_id": user_id,
                                       "item_query": item_name,
                                       "quantity": 1
                                   })
        
        if add_response.status_code == 200:
            result = add_response.json()
            print(f"   ✅ API call successful")
            print(f"   Success: {result.get('success', False)}")
            print(f"   Message: {result.get('message', 'No message')}")
            print(f"   Has 'replacements' key: {'replacements' in result}")
            print(f"   Has 'replacement' key: {'replacement' in result}")
            
            if 'replacements' in result:
                replacements = result['replacements']
                print(f"   Replacements count: {len(replacements) if replacements else 0}")
                if replacements:
                    print(f"   First replacement: {replacements[0].get('item_name', 'Unknown')}")
            
            if 'replacement' in result:
                replacement = result['replacement']
                print(f"   Single replacement: {replacement.get('item_name', 'Unknown') if replacement else 'None'}")
            
            # Check warning and incentive
            if result.get('warning'):
                print(f"   ⚠️  Warning: {result['warning']}")
            if result.get('incentive'):
                print(f"   💰 Incentive: {result['incentive']}")
                
        else:
            print(f"   ❌ API call failed: {add_response.status_code}")
            print(f"   Error: {add_response.text}")
        
        # Clear cart before next test
        requests.post(f"{BASE_URL}/clear_cart", json={"user_id": user_id})
    
    print("\n" + "=" * 50)
    print("DEBUG COMPLETE")

def test_inventory_items():
    """Check what items are available in inventory."""
    print("\n🗂️  CHECKING INVENTORY...")
    
    inventory_response = requests.get(f"{BASE_URL}/get_inventory")
    if inventory_response.status_code == 200:
        inventory = inventory_response.json()
        items = inventory.get('inventory', [])
        
        print(f"Total items in inventory: {len(items)}")
        
        # Group by item name and check expiry dates
        from collections import defaultdict
        from datetime import datetime
        
        grouped = defaultdict(list)
        for item in items:
            grouped[item['item_name']].append(item)
        
        print("\nItems with multiple entries (potential for replacements):")
        today = datetime.strptime("2025-07-10", "%Y-%m-%d")
        
        for item_name, variants in grouped.items():
            if len(variants) > 1:
                print(f"\n📦 {item_name}:")
                for variant in variants:
                    expiry = datetime.strptime(variant['expiry_date'], "%Y-%m-%d")
                    days_left = (expiry - today).days
                    status = "EXPIRED" if days_left < 0 else f"{days_left} days left"
                    price = variant['price_per_unit']
                    max_discount = variant.get('max_discount', 0)
                    print(f"   - ID: {variant['item_id']} | ${price:.2f} | {status} | Max discount: {max_discount}%")

if __name__ == "__main__":
    try:
        debug_replacement_suggestions()
        test_inventory_items()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Please start the backend first.")
    except Exception as e:
        print(f"❌ Error: {e}")
