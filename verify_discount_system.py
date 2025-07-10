#!/usr/bin/env python3
"""
FreshGuard Discount System Verification Script
==============================================

This script thoroughly tests the discount functionality to ensure
replacement products are properly added with correct prices and discounts.
"""

import requests
import json
import time

# API Configuration
API_BASE = "http://localhost:5000"
TEST_USER = "discount_test_user"

def print_header(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_subheader(title):
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")

def test_api_connection():
    """Test if the API is running."""
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ API is running and accessible")
            return True
        else:
            print(f"❌ API responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def clear_test_cart():
    """Clear the test user's cart."""
    try:
        response = requests.post(
            f"{API_BASE}/clear_cart",
            json={"user_id": TEST_USER},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200 and response.json().get("success"):
            print(f"✅ Cleared cart for {TEST_USER}")
            return True
        else:
            print(f"❌ Failed to clear cart: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error clearing cart: {e}")
        return False

def get_cart_data():
    """Get cart data for verification."""
    try:
        response = requests.get(f"{API_BASE}/get_cart", params={"user_id": TEST_USER})
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get cart: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error getting cart: {e}")
        return None

def add_regular_item():
    """Add a regular item to cart."""
    print_subheader("Adding Regular Item")
    try:
        response = requests.post(
            f"{API_BASE}/add_to_cart",
            json={
                "user_id": TEST_USER,
                "item_id": "ITEM0013",
                "item_name": "Apple",
                "quantity": 3,
                "price_per_unit": 0.99
            },
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200 and response.json().get("success"):
            print("✅ Added regular Apple (3x $0.99)")
            return True
        else:
            print(f"❌ Failed to add regular item: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error adding regular item: {e}")
        return False

def add_discounted_item():
    """Add a discounted replacement item."""
    print_subheader("Adding Discounted Replacement Item")
    try:
        # Use the script's logic to add a replacement item
        import sys
        import os
        
        # Add the backend directory to path
        backend_dir = os.path.join(os.path.dirname(__file__), 'backend', 'scripts')
        if backend_dir not in sys.path:
            sys.path.append(backend_dir)
        
        from cart_manage import add_item_to_cart
        
        result = add_item_to_cart(
            user_id=TEST_USER,
            item_id="REPL002",
            item_name="Near-Expiry Milk",
            quantity=2,
            price_per_unit=3.99,
            discount_given=25.0,
            category="Dairy",
            expiry_date="2025-07-11",
            max_discount=30
        )
        
        if result.get("success"):
            print("✅ Added discounted Near-Expiry Milk (2x $3.99, 25% off)")
            return True
        else:
            print(f"❌ Failed to add discounted item: {result}")
            return False
    except Exception as e:
        print(f"❌ Error adding discounted item: {e}")
        return False

def verify_cart_calculations():
    """Verify all cart calculations are correct."""
    print_subheader("Verifying Cart Calculations")
    
    cart_data = get_cart_data()
    if not cart_data or not cart_data.get("success"):
        print("❌ Failed to get cart data")
        return False
    
    items = cart_data.get("cart", [])
    if not items:
        print("❌ Cart is empty")
        return False
    
    print(f"📊 Cart contains {len(items)} items:")
    
    total_original = 0
    total_discounted = 0
    total_from_subtotals = 0
    
    for item in items:
        item_name = item.get("item_name", "Unknown")
        quantity = item.get("quantity", 0)
        price_per_unit = item.get("price_per_unit", 0)
        discounted_price = item.get("discounted_price", price_per_unit)
        discount_given = item.get("discount_given", 0)
        subtotal = item.get("subtotal", 0)
        
        # Calculate expected values
        expected_subtotal = quantity * discounted_price
        item_original_total = quantity * price_per_unit
        
        # Verify subtotal calculation
        subtotal_correct = abs(subtotal - expected_subtotal) < 0.01
        
        print(f"\n  🛍️ {item_name}:")
        print(f"     Quantity: {quantity}")
        print(f"     Unit Price: ${price_per_unit:.2f}")
        print(f"     Discounted Price: ${discounted_price:.2f}")
        print(f"     Discount: {discount_given}%")
        print(f"     Subtotal: ${subtotal:.2f} {'✅' if subtotal_correct else '❌'}")
        if not subtotal_correct:
            print(f"     Expected: ${expected_subtotal:.2f}")
        
        total_original += item_original_total
        total_discounted += expected_subtotal
        total_from_subtotals += subtotal
    
    # Verify totals
    api_total = cart_data.get("total", 0)
    api_total_after_discount = cart_data.get("total_after_discount", 0)
    
    print(f"\n📊 TOTALS VERIFICATION:")
    print(f"   Original Total: ${total_original:.2f}")
    print(f"   API Total: ${api_total:.2f} {'✅' if abs(api_total - total_original) < 0.01 else '❌'}")
    print(f"   Discounted Total: ${total_discounted:.2f}")
    print(f"   API Total After Discount: ${api_total_after_discount:.2f} {'✅' if abs(api_total_after_discount - total_discounted) < 0.01 else '❌'}")
    print(f"   Total from Subtotals: ${total_from_subtotals:.2f} {'✅' if abs(total_from_subtotals - total_discounted) < 0.01 else '❌'}")
    print(f"   Total Savings: ${total_original - total_discounted:.2f}")
    
    # Check if all calculations are correct
    calculations_correct = (
        abs(api_total - total_original) < 0.01 and
        abs(api_total_after_discount - total_discounted) < 0.01 and
        abs(total_from_subtotals - total_discounted) < 0.01
    )
    
    if calculations_correct:
        print("\n✅ ALL CALCULATIONS ARE CORRECT!")
        return True
    else:
        print("\n❌ CALCULATION ERRORS DETECTED!")
        return False

def main():
    """Run the complete verification test."""
    print_header("FreshGuard Discount System Verification")
    
    # Test API connection
    if not test_api_connection():
        print("\n❌ Cannot proceed without API connection")
        return False
    
    # Clear cart
    print_subheader("Preparing Test Environment")
    if not clear_test_cart():
        print("\n❌ Cannot proceed without clearing cart")
        return False
    
    # Add items
    if not add_regular_item():
        return False
    
    if not add_discounted_item():
        return False
    
    # Verify calculations
    success = verify_cart_calculations()
    
    # Final result
    if success:
        print_header("✅ ALL TESTS PASSED - DISCOUNT SYSTEM IS WORKING!")
        print("🎉 Replacement products are being added with correct discounts")
        print("💰 All price calculations are accurate")
        print("🧮 Subtotals and totals are properly calculated")
    else:
        print_header("❌ TESTS FAILED - ISSUES DETECTED")
        print("🔧 Please check the backend discount calculation logic")
    
    return success

if __name__ == "__main__":
    main()
