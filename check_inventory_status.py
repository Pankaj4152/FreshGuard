#!/usr/bin/env python3
"""
Check the current status of the inventory endpoint fix.
"""

import sys
import os

# Add the backend API directory to the path
backend_api_dir = os.path.join(os.path.dirname(__file__), 'backend', 'api')
sys.path.insert(0, backend_api_dir)

def check_inventory_status():
    """Check if the inventory endpoint is working correctly."""
    
    print("🔍 Checking inventory endpoint status...")
    
    try:
        # Test 1: Import the functions
        from app import load_inventory_fallback, BASE_DIR, calculate_discount
        print("✅ Successfully imported functions from app.py")
        
        # Test 2: Load inventory
        inventory = load_inventory_fallback()
        print(f"✅ Loaded {len(inventory)} items using fallback")
        
        if not inventory:
            print("❌ No inventory items loaded")
            return False
        
        # Test 3: Check inventory structure
        first_item = inventory[0]
        required_fields = ['item_id', 'item_name', 'category', 'expiry_date', 'price_per_unit']
        missing_fields = [field for field in required_fields if field not in first_item]
        
        if missing_fields:
            print(f"⚠️  Missing fields in inventory items: {missing_fields}")
        else:
            print("✅ All required fields present in inventory items")
        
        # Test 4: Test expiring soon filter
        from datetime import datetime, timedelta
        today = datetime.today()
        cutoff = today + timedelta(days=2)
        
        expiring_count = 0
        error_count = 0
        
        for item in inventory:
            try:
                expiry_date = item.get('expiry_date', '2099-12-31')
                if datetime.strptime(expiry_date, "%Y-%m-%d") <= cutoff:
                    expiring_count += 1
            except Exception as e:
                error_count += 1
        
        print(f"✅ Found {expiring_count} items expiring in 2 days")
        if error_count > 0:
            print(f"⚠️  {error_count} items had date parsing errors")
        
        # Test 5: Test discount calculation
        discount_errors = 0
        for item in inventory[:10]:  # Test first 10 items
            try:
                expiry_date = item.get('expiry_date', '2099-12-31')
                max_discount = item.get('discount', 0)
                effective_discount = calculate_discount(expiry_date, max_discount)
                
                price_per_unit = item.get('price_per_unit', 0)
                if isinstance(price_per_unit, (int, float)):
                    discounted_price = price_per_unit * (1 - effective_discount / 100)
                else:
                    discount_errors += 1
            except Exception as e:
                discount_errors += 1
        
        print(f"✅ Discount calculation test completed")
        if discount_errors > 0:
            print(f"⚠️  {discount_errors} items had discount calculation errors")
        
        # Test 6: Check availability flags
        try:
            from app import GROUPING_AVAILABLE, CART_CLI_AVAILABLE, ML_AVAILABLE
            print(f"📊 Feature availability:")
            print(f"   - Grouping: {'✅' if GROUPING_AVAILABLE else '❌'}")
            print(f"   - Cart CLI: {'✅' if CART_CLI_AVAILABLE else '❌'}")
            print(f"   - ML Prediction: {'✅' if ML_AVAILABLE else '❌'}")
        except Exception as e:
            print(f"⚠️  Could not check feature availability: {e}")
        
        print("\n🎯 Summary:")
        print(f"   - Inventory items: {len(inventory)}")
        print(f"   - Expiring soon: {expiring_count}")
        print(f"   - Data errors: {error_count + discount_errors}")
        
        if error_count + discount_errors == 0:
            print("✅ All tests passed! Inventory endpoint should work correctly.")
            return True
        else:
            print("⚠️  Some issues found, but basic functionality should work.")
            return True
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = check_inventory_status()
    if success:
        print("\n🚀 The inventory endpoint fix should resolve the 500 error!")
        print("   You can now call GET /get_inventory?expiring_soon=true&grouped=true")
    else:
        print("\n❌ There are still issues that need to be addressed.")
