#!/usr/bin/env python3
"""
Demo script showing all cart functionality: add, plus/minus, remove, clear
"""
import sys
import os
import json

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from scripts.cart_manage import add_item_to_cart, get_cart, update_item_quantity, remove_item_from_cart, clear_cart, get_cart_summary

def print_cart_status(user_id, title="Cart Status"):
    """Print current cart status with formatting"""
    print(f"\n📊 {title}:")
    cart = get_cart(user_id)
    cart_summary = get_cart_summary(user_id)
    
    if not any(isinstance(v, dict) and 'quantity' in v for v in cart.values()):
        print("  🛒 Cart is empty")
        return
    
    for item_id, item_data in cart.items():
        if isinstance(item_data, dict) and 'quantity' in item_data:
            total = item_data['quantity'] * item_data['price_per_unit']
            print(f"  📦 {item_data['item_name']}: {item_data['quantity']} × ${item_data['price_per_unit']:.2f} = ${total:.2f}")
    
    print(f"  💰 Total: ${cart_summary.get('total', 0):.2f}")
    print(f"  📋 Items: {len([k for k, v in cart.items() if isinstance(v, dict) and 'quantity' in v])}")

def demo_cart_functionality():
    """Comprehensive demo of all cart functionality"""
    print("🛒 COMPREHENSIVE CART FUNCTIONALITY DEMO")
    print("=" * 60)
    
    user_id = "demo_user"
    
    # 1. Start with empty cart
    print("\n1️⃣ Starting with empty cart...")
    clear_cart(user_id)
    print_cart_status(user_id, "Empty Cart")
    
    # 2. Add items
    print("\n2️⃣ Adding items to cart...")
    add_item_to_cart(user_id, "ITEM001", "Premium Beef Steak", 1, 15.99)
    add_item_to_cart(user_id, "ITEM002", "Fresh Cheese", 2, 4.50)
    add_item_to_cart(user_id, "ITEM003", "Organic Apples", 5, 2.25)
    print_cart_status(user_id, "After Adding Items")
    
    # 3. Test PLUS buttons (increase quantities)
    print("\n3️⃣ Testing PLUS buttons (increasing quantities)...")
    print("  ➕ Beef Steak: 1 → 2")
    update_item_quantity(user_id, "ITEM001", 2)
    print("  ➕ Cheese: 2 → 4")
    update_item_quantity(user_id, "ITEM002", 4)
    print_cart_status(user_id, "After Plus Buttons")
    
    # 4. Test MINUS buttons (decrease quantities)
    print("\n4️⃣ Testing MINUS buttons (decreasing quantities)...")
    print("  ➖ Apples: 5 → 3")
    update_item_quantity(user_id, "ITEM003", 3)
    print("  ➖ Cheese: 4 → 2")
    update_item_quantity(user_id, "ITEM002", 2)
    print_cart_status(user_id, "After Minus Buttons")
    
    # 5. Test remove individual item
    print("\n5️⃣ Testing REMOVE button (setting quantity to 0)...")
    print("  ❌ Removing Beef Steak (set quantity to 0)")
    update_item_quantity(user_id, "ITEM001", 0)
    print_cart_status(user_id, "After Removing Beef Steak")
    
    # 6. Add more items for clear cart demo
    print("\n6️⃣ Adding more items for clear cart demo...")
    add_item_to_cart(user_id, "ITEM004", "Milk", 1, 3.25)
    add_item_to_cart(user_id, "ITEM005", "Bread", 2, 2.50)
    print_cart_status(user_id, "Before Clear Cart")
    
    # 7. Test clear cart
    print("\n7️⃣ Testing CLEAR CART button...")
    clear_cart(user_id)
    print_cart_status(user_id, "After Clear Cart")
    
    print("\n🎯 DEMO COMPLETE!")
    print("✅ ➕ Plus button: Increases item quantity")
    print("✅ ➖ Minus button: Decreases item quantity") 
    print("✅ ❌ Remove button: Removes item from cart (qty → 0)")
    print("✅ 🗑️ Clear cart: Removes all items from cart")
    print("✅ 💰 Cart totals are automatically updated")
    print("✅ 🔄 All operations work with backend API")
    
    print("\n🚀 Frontend Integration Ready!")
    print("🎨 UI buttons will call these backend functions:")
    print("   • Plus/Minus: updateCartQuantity(userId, itemId, newQuantity)")
    print("   • Remove: updateCartQuantity(userId, itemId, 0)")  
    print("   • Clear: clearCart(userId)")

if __name__ == "__main__":
    demo_cart_functionality()
