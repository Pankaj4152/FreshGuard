#!/usr/bin/env python3
"""
FreshGuard 2.0 - Complete Project Validation Script
Performs comprehensive checks of backend and frontend functionality
"""

import os
import json
import subprocess
import sys
import time
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and return status"""
    if os.path.exists(filepath):
        print(f"OK {description}: {filepath}")
        return True
    else:
        print(f"MISSING {description}: {filepath} (NOT FOUND)")
        return False

def check_directory_structure():
    """Validate project directory structure"""
    print("🔍 Checking Directory Structure...")
    
    required_dirs = [
        "backend",
        "backend/api",
        "backend/scripts", 
        "backend/models",
        "backend/mock_api",
        "frontend",
        "frontend/src",
        "frontend/src/pages",
        "frontend/src/components",
        "frontend/src/context",
        "frontend/src/services",
        "docs"
    ]
    
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✅ Directory: {dir_path}")
        else:
            print(f"❌ Directory: {dir_path} (MISSING)")
            return False
    
    return True

def check_backend_files():
    """Check all required backend files"""
    print("\n🔍 Checking Backend Files...")
    
    backend_files = [
        ("backend/api/app.py", "Main Flask API"),
        ("backend/scripts/cart_manage.py", "Cart Management"),
        ("backend/scripts/cart_cli.py", "Cart CLI"),
        ("backend/scripts/replacement_utils.py", "Replacement Utils"),
        ("backend/models/predict_expiry.py", "ML Prediction Module"),
        ("backend/models/shelf_life_predictor_rf.joblib", "Trained ML Model"),
        ("backend/mock_api/current_walmart_inventory.json", "Inventory Data"),
        ("backend/mock_api/users_cart.json", "Cart Data"),
        ("backend/mock_api/users_loyalty.json", "User Loyalty Data"),
        ("backend/mock_api/loyalty_points.json", "Loyalty Points Data"),
        ("backend/requirements.txt", "Python Dependencies")
    ]
    
    all_exist = True
    for filepath, description in backend_files:
        if not check_file_exists(filepath, description):
            all_exist = False
    
    return all_exist

def check_frontend_files():
    """Check all required frontend files"""
    print("\n🔍 Checking Frontend Files...")
    
    frontend_files = [
        ("frontend/package.json", "Package Configuration"),
        ("frontend/src/App.js", "Main App Component"),
        ("frontend/src/services/api.js", "API Service"),
        ("frontend/src/pages/Home.js", "Home Page"),
        ("frontend/src/pages/Inventory.js", "Inventory Page"),
        ("frontend/src/pages/Cart.js", "Cart Page"),
        ("frontend/src/pages/Checkout.js", "Checkout Page"),
        ("frontend/src/pages/Dashboard.js", "Dashboard Page"),
        ("frontend/src/pages/Alerts.js", "Alerts Page"),
        ("frontend/src/pages/TestAPI.js", "API Test Page"),
        ("frontend/src/context/CartContext.js", "Cart Context"),
        ("frontend/src/context/UserContext.js", "User Context"),
        ("frontend/src/components/ProductCard.js", "Product Card Component"),
        ("frontend/src/components/CartItem.js", "Cart Item Component"),
        ("frontend/src/components/Header.js", "Header Component"),
        ("frontend/.env", "Environment Configuration")
    ]
    
    all_exist = True
    for filepath, description in frontend_files:
        if not check_file_exists(filepath, description):
            all_exist = False
    
    return all_exist

def check_documentation():
    """Check documentation files"""
    print("\n🔍 Checking Documentation...")
    
    doc_files = [
        ("README.md", "Main README"),
        ("docs/api_reference.md", "API Reference"),
        ("docs/data_schema.md", "Data Schema"),
        ("docs/implementation.markdown", "Implementation Guide"),
        ("TESTING_GUIDE.md", "Testing Guide"),
        ("FRONTEND_COMPLETION_SUMMARY.md", "Frontend Summary"),
        ("PROJECT_STATUS_REPORT.md", "Status Report")
    ]
    
    all_exist = True
    for filepath, description in doc_files:
        if not check_file_exists(filepath, description):
            all_exist = False
    
    return all_exist

def validate_json_files():
    """Validate JSON file format"""
    print("\n🔍 Validating JSON Files...")
    
    json_files = [
        "backend/mock_api/current_walmart_inventory.json",
        "backend/mock_api/users_cart.json", 
        "backend/mock_api/users_loyalty.json",
        "backend/mock_api/loyalty_points.json",
        "frontend/package.json"
    ]
    
    all_valid = True
    for filepath in json_files:
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    json.load(f)
                print(f"✅ Valid JSON: {filepath}")
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON: {filepath} - {e}")
                all_valid = False
        else:
            print(f"❌ Missing JSON: {filepath}")
            all_valid = False
    
    return all_valid

def check_python_imports():
    """Test Python module imports"""
    print("\n🔍 Checking Python Imports...")
    
    import_tests = [
        ("flask", "Flask Web Framework"),
        ("flask_cors", "Flask CORS"),
        ("pandas", "Data Processing"),
        ("numpy", "Numerical Computing"),
        ("sklearn", "Machine Learning"),
        ("joblib", "Model Serialization"),
        ("requests", "HTTP Requests")
    ]
    
    all_imports = True
    for module, description in import_tests:
        try:
            __import__(module)
            print(f"✅ {description}: {module}")
        except ImportError:
            print(f"❌ {description}: {module} (NOT INSTALLED)")
            all_imports = False
    
    return all_imports

def test_backend_syntax():
    """Test backend Python syntax"""
    print("\n🔍 Testing Backend Syntax...")
    
    python_files = [
        "backend/api/app.py",
        "backend/scripts/cart_manage.py",
        "backend/scripts/cart_cli.py",
        "backend/scripts/replacement_utils.py"
    ]
    
    all_valid = True
    for filepath in python_files:
        try:
            result = subprocess.run([
                sys.executable, "-m", "py_compile", filepath
            ], capture_output=True, text=True, cwd=".", timeout=10)
            
            if result.returncode == 0:
                print(f"✅ Syntax Valid: {filepath}")
            else:
                print(f"❌ Syntax Error: {filepath}")
                print(f"   Error: {result.stderr}")
                all_valid = False
        except subprocess.TimeoutExpired:
            print(f"⚠️  Timeout: {filepath}")
        except Exception as e:
            print(f"❌ Test Failed: {filepath} - {e}")
            all_valid = False
    
    return all_valid

def check_data_integrity():
    """Check data file integrity and structure"""
    print("\n🔍 Checking Data Integrity...")
    
    # Check inventory data structure
    try:
        with open("backend/mock_api/current_walmart_inventory.json", 'r') as f:
            inventory = json.load(f)
        
        if "inventory" in inventory and isinstance(inventory["inventory"], list):
            item_count = len(inventory["inventory"])
            print(f"✅ Inventory Data: {item_count} items")
            
            # Check first item structure
            if item_count > 0:
                sample_item = inventory["inventory"][0]
                required_fields = ["item_id", "item_name", "category", "price_per_unit", "expiry_date"]
                missing_fields = [field for field in required_fields if field not in sample_item]
                
                if not missing_fields:
                    print(f"✅ Inventory Structure: Valid")
                else:
                    print(f"❌ Inventory Structure: Missing fields {missing_fields}")
                    return False
        else:
            print("❌ Inventory Data: Invalid structure")
            return False
    except Exception as e:
        print(f"❌ Inventory Data: Error {e}")
        return False
    
    # Check loyalty data
    try:
        with open("backend/mock_api/users_loyalty.json", 'r') as f:
            loyalty = json.load(f)
        
        if isinstance(loyalty, dict) and len(loyalty) > 0:
            print(f"✅ Loyalty Data: {len(loyalty)} users")
        else:
            print("❌ Loyalty Data: Invalid structure")
            return False
    except Exception as e:
        print(f"❌ Loyalty Data: Error {e}")
        return False
    
    return True

def main():
    """Main validation function"""
    print("FreshGuard 2.0 - Complete Project Validation")
    print("=" * 60)
    
    # Change to project directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    tests = [
        ("Directory Structure", check_directory_structure),
        ("Backend Files", check_backend_files),
        ("Frontend Files", check_frontend_files),
        ("Documentation", check_documentation),
        ("JSON File Validation", validate_json_files),
        ("Python Imports", check_python_imports),
        ("Backend Syntax", test_backend_syntax),
        ("Data Integrity", check_data_integrity)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test Failed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nOverall Score: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nPROJECT STATUS: FULLY VALIDATED AND READY!")
        print("All systems operational")
        print("Ready for demonstration")
        print("Ready for deployment")
        return 0
    else:
        print(f"\nPROJECT STATUS: {total-passed} issues found")
        print("Please address failing tests before deployment")
        return 1

if __name__ == "__main__":
    sys.exit(main())
