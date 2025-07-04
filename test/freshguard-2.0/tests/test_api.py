"""
Test for FreshGuard 2.0 Flask API
---------------------------------
This script tests the main API endpoints using the requests library.
Run the backend first: python backend/api/app.py
"""
import requests
import time

BASE_URL = "http://localhost:5000"
USER_ID = "testuser"

def test_add_item():
    print("Testing /add_item ...")
    payload = {
        "user_id": USER_ID,
        "item": "milk",
        "purchase_date": "2025-07-03",
        "quantity": 1,
        "storage": "refrigerated"
    }
    r = requests.post(f"{BASE_URL}/add_item", json=payload)
    print(r.json())
    assert r.status_code == 200

def test_alerts():
    print("Testing /alerts ...")
    r = requests.get(f"{BASE_URL}/alerts/{USER_ID}")
    print(r.json())
    assert r.status_code == 200

def test_discounts():
    print("Testing /discounts ...")
    r = requests.get(f"{BASE_URL}/discounts")
    print(r.json())
    assert r.status_code == 200

def test_redeem_discount():
    print("Testing /redeem_discount ...")
    payload = {"user_id": USER_ID, "item": "milk"}
    r = requests.post(f"{BASE_URL}/redeem_discount", json=payload)
    print(r.json())
    assert r.status_code == 200

def test_metrics():
    print("Testing /metrics ...")
    r = requests.get(f"{BASE_URL}/metrics/{USER_ID}")
    print(r.json())
    assert r.status_code == 200

if __name__ == "__main__":
    test_add_item()
    time.sleep(1)
    test_alerts()
    test_discounts()
    test_redeem_discount()
    test_metrics()
    print("All API endpoint tests completed.") 