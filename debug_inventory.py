#!/usr/bin/env python3
"""
Test script to debug the inventory loading issue.
"""

import sys
import os

# Add the scripts directory to the path
backend_dir = os.path.dirname(__file__)
scripts_dir = os.path.join(backend_dir, 'backend', 'scripts')
sys.path.insert(0, scripts_dir)

try:
    from cart_manage import load_inventory
    print("✅ Successfully imported load_inventory")
    
    inventory = load_inventory()
    print(f"✅ Loaded {len(inventory)} items")
    
    if inventory:
        print(f"📦 First item structure: {inventory[0].keys()}")
        print(f"📦 First item: {inventory[0]}")
    
    # Test grouping functionality
    try:
        sys.path.insert(0, os.path.join(backend_dir, 'backend', 'scripts'))
        from inventory_grouping import group_inventory_by_product
        print("✅ Successfully imported group_inventory_by_product")
        
        grouped_data = group_inventory_by_product()
        print(f"✅ Grouped data keys: {grouped_data.keys()}")
        print(f"📦 All grouped count: {len(grouped_data.get('all_grouped', []))}")
        
        if grouped_data.get('all_grouped'):
            print(f"📦 First grouped item structure: {grouped_data['all_grouped'][0].keys()}")
            print(f"📦 First grouped item: {grouped_data['all_grouped'][0]}")
            
    except Exception as e:
        print(f"❌ Error with grouping: {e}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"❌ Error loading inventory: {e}")
    import traceback
    traceback.print_exc()
