#!/usr/bin/env python3
"""
Script to update impact_dash.json values for testing dashboard updates
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'scripts'))

from cart_manage import update_impact_dash, get_user_impact_data
import json

def update_user_impact(user_id, **kwargs):
    """Update user impact data in impact_dash.json"""
    
    print(f"Updating impact data for {user_id}...")
    print("Before update:")
    before_data = get_user_impact_data(user_id)
    for key, value in before_data.items():
        print(f"  {key}: {value}")
    
    # Update the data
    result = update_impact_dash(user_id, **kwargs)
    
    print("\nAfter update:")
    after_data = get_user_impact_data(user_id)
    for key, value in after_data.items():
        print(f"  {key}: {value}")
    
    print(f"\nUpdate successful: {result is not None}")
    return result

def add_sample_data():
    """Add some sample data to see the dashboard update"""
    
    # Example 1: Update food saved
    print("=" * 50)
    print("EXAMPLE 1: Increasing food saved by 2.5 kg")
    update_user_impact("user1", total_food_saved=12.5)
    
    # Example 2: Update money saved  
    print("\n" + "=" * 50)
    print("EXAMPLE 2: Increasing money saved by $10")
    current = get_user_impact_data("user1")
    new_money = current.get('total_money_saved', 0) + 10
    update_user_impact("user1", total_money_saved=new_money)
    
    # Example 3: Update loyalty points
    print("\n" + "=" * 50) 
    print("EXAMPLE 3: Adding 100 loyalty points")
    current = get_user_impact_data("user1")
    new_points = current.get('total_loyalty_points', 0) + 100
    update_user_impact("user1", total_loyalty_points=new_points)

def reset_to_original():
    """Reset to original values in your file"""
    print("Resetting to original values...")
    update_user_impact("user1",
        total_food_saved=10,
        total_money_saved=47.25,
        total_co2_reduced=23.4,
        total_loyalty_points=191,
        total_orders=8,
        total_items=24
    )

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        reset_to_original()
    elif len(sys.argv) > 1 and sys.argv[1] == "demo":
        add_sample_data()
    else:
        print("Usage:")
        print("  python update_impact_demo.py demo    # Run demo updates")
        print("  python update_impact_demo.py reset   # Reset to original values")
        print("\nCurrent data:")
        data = get_user_impact_data("user1")
        for key, value in data.items():
            print(f"  {key}: {value}")
