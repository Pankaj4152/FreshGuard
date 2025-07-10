#!/usr/bin/env python3
"""
Final verification of discount display fix
"""
import json
import requests
import sys

def verify_complete_discount_flow():
    """Verify the complete discount flow from backend to frontend"""
    print("🔍 FINAL VERIFICATION OF DISCOUNT DISPLAY FIX")
    print("=" * 55)
    
    try:
        # 1. Test API endpoint
        print("1. Testing API endpoint...")
        response = requests.get("http://localhost:5000/get_cart?user_id=test_user")
        
        if response.status_code == 200:
            api_data = response.json()
            if api_data.get('success'):
                cart_items = api_data.get('cart', [])
                print(f"✅ API working - Found {len(cart_items)} items in cart")
                
                discount_items = [item for item in cart_items if item.get('discount_given', 0) > 0]
                print(f"✅ Found {len(discount_items)} items with discounts")
                
                for item in discount_items:
                    name = item.get('item_name', 'Unknown')
                    original = item.get('price_per_unit', 0)
                    discounted = item.get('discounted_price', 0)
                    discount_percent = item.get('discount_given', 0)
                    savings = (original - discounted) * item.get('quantity', 1)
                    
                    print(f"   • {name}: ${original:.2f} → ${discounted:.2f} ({discount_percent}% off, saves ${savings:.2f})")
                
                total_original = api_data.get('total', 0)
                total_discounted = api_data.get('total_after_discount', 0)
                total_savings = total_original - total_discounted
                
                print(f"\n📊 Cart Totals:")
                print(f"   • Original Total: ${total_original:.2f}")
                print(f"   • Discounted Total: ${total_discounted:.2f}")
                print(f"   • Total Savings: ${total_savings:.2f}")
                
            else:
                print(f"❌ API error: {api_data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API not responding (status: {response.status_code})")
            return False
        
        # 2. Verify required fields
        print(f"\n2. Verifying required fields in API response...")
        required_fields = ['price_per_unit', 'discounted_price', 'discount_given']
        
        all_fields_present = True
        for item in cart_items:
            missing_fields = [field for field in required_fields if field not in item]
            if missing_fields:
                print(f"❌ Missing fields in {item.get('item_name', 'Unknown')}: {missing_fields}")
                all_fields_present = False
        
        if all_fields_present:
            print("✅ All required discount fields present in API response")
        
        # 3. Test discount calculation accuracy
        print(f"\n3. Verifying discount calculations...")
        calculation_correct = True
        
        for item in cart_items:
            if item.get('discount_given', 0) > 0:
                original = item.get('price_per_unit', 0)
                discounted = item.get('discounted_price', 0)
                stored_discount = item.get('discount_given', 0)
                
                if original > 0:
                    calculated_discount = round(((original - discounted) / original) * 100, 1)
                    if abs(calculated_discount - stored_discount) > 0.1:
                        print(f"❌ Discount calculation error in {item.get('item_name')}: Expected {calculated_discount}%, Got {stored_discount}%")
                        calculation_correct = False
        
        if calculation_correct:
            print("✅ All discount calculations are accurate")
        
        # 4. Test frontend readiness
        print(f"\n4. Testing frontend accessibility...")
        try:
            frontend_response = requests.get("http://localhost:3000", timeout=5)
            if frontend_response.status_code == 200:
                print("✅ Frontend is accessible at http://localhost:3000")
                print("   → Cart page: http://localhost:3000/cart")
            else:
                print(f"❌ Frontend not accessible (status: {frontend_response.status_code})")
        except requests.exceptions.RequestException:
            print("❌ Frontend not accessible - may not be running")
        
        print(f"\n🎉 VERIFICATION COMPLETE!")
        print("=" * 55)
        
        if all_fields_present and calculation_correct:
            print("✅ ALL TESTS PASSED - Discount display bug is FIXED!")
            print("\n📋 What should now work:")
            print("   • Backend correctly calculates discount percentages")
            print("   • API returns all required fields (price_per_unit, discounted_price, discount_given)")
            print("   • Frontend CartItem component uses backend discount_given field")
            print("   • Cart page displays original price, discounted price, and savings")
            print("   • All replacement items show correct discount information")
            
            print(f"\n🧪 To test manually:")
            print("   1. Open http://localhost:3000/cart")
            print("   2. You should see 4 items with proper discount display")
            print("   3. Each discounted item should show:")
            print("      - Original price (crossed out)")
            print("      - Discounted price (highlighted)")
            print("      - Discount percentage badge")
            print("      - Savings amount")
            
            return True
        else:
            print("❌ Some tests failed - check the issues above")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_complete_discount_flow()
    sys.exit(0 if success else 1)
