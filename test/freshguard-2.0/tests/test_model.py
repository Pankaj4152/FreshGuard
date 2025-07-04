"""
Test for FreshGuard 2.0 Shelf Life Prediction Model
--------------------------------------------------
This script tests the predict_shelf_life function with known items and storage types.
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend/models'))
from predict_expiry import predict_shelf_life

def test_predict():
    # Test cases: (item, storage, expected_range)
    tests = [
        ("milk", "refrigerated", (5, 10)),
        ("eggs", "refrigerated", (15, 25)),
        ("apple", "room_temp", (20, 40)),
        ("chicken", "refrigerated", (3, 7)),
        ("bread", "room_temp", (3, 7)),
    ]
    for item, storage, (low, high) in tests:
        days = predict_shelf_life(item, storage)
        print(f"{item} ({storage}): {days} days")
        assert low <= days <= high, f"Prediction for {item} out of expected range!"
    print("All ML model tests passed.")

if __name__ == "__main__":
    test_predict() 