import json
import numpy as np
from datetime import datetime, timedelta

categories = ['Beverages', 'Dairy', 'Produce', 'Bakery', 'Meat']
items = {
    'Beverages': ['Juice', 'Soda', 'Milk'],
    'Dairy': ['Cheese', 'Yogurt', 'Butter'],
    'Produce': ['Apple', 'Banana', 'Carrot'],
    'Bakery': ['Bread', 'Bagel', 'Muffin'],
    'Meat': ['Chicken', 'Beef', 'Pork']
}
shelf_life_ranges = {
    'Beverages': (5, 14),
    'Dairy': (7, 14),
    'Produce': (7, 30),
    'Bakery': (3, 7),
    'Meat': (3, 10)
}
category_storage_map = {
    'Beverages': ['ambient', 'refrigerated'],
    'Dairy': ['refrigerated'],
    'Produce': ['ambient', 'refrigerated'],
    'Bakery': ['ambient'],
    'Meat': ['refrigerated', 'frozen']
}
temp_ranges = {
    'ambient': (15, 25),
    'refrigerated': (2, 8),
    'frozen': (-18, -10)
}
humidity_ranges = {
    'ambient': (0.4, 0.7),
    'refrigerated': (0.7, 0.95),
    'frozen': (0.2, 0.5)
}

def generate_inventory_json(num_rows=100, output_file="data/walmart_inventory_training.json", seed=None):
    if seed is not None:
        np.random.seed(seed)
    data = []
    today = datetime.today()
    for i in range(num_rows):
        category = np.random.choice(categories)
        item_name = np.random.choice(items[category])
        storage_type = np.random.choice(category_storage_map[category])
        shelf_life_days = np.random.randint(*shelf_life_ranges[category])
        # Ensure expiry_date is at least today or later
        arrival_date = today - timedelta(days=np.random.randint(0, max(1, shelf_life_days)))
        expiry_date = arrival_date + timedelta(days=shelf_life_days)
        if expiry_date < today:
            # Force expiry_date to today and adjust arrival_date
            expiry_date = today
            arrival_date = expiry_date - timedelta(days=shelf_life_days)
        days_to_expiry = (expiry_date - today).days
        current_temp_c = round(np.random.uniform(*temp_ranges[storage_type]), 1)
        humidity = round(np.random.uniform(*humidity_ranges[storage_type]), 2)
        current_stock = np.random.randint(10, 100)
        price_per_unit = round(np.random.uniform(0.99, 19.99), 2)
        data.append({
            "item_id": f"ITEM{i:04d}",
            "item_name": item_name,
            "category": category,
            "storage_type": storage_type,
            "arrival_date": arrival_date.strftime("%Y-%m-%d"),
            "expiry_date": expiry_date.strftime("%Y-%m-%d"),
            "shelf_life_days": shelf_life_days,
            "current_temp_c": current_temp_c,
            "humidity": humidity,
            "current_stock": current_stock,
            "price_per_unit": price_per_unit,
            "days_to_expiry": days_to_expiry
        })
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {output_file} with {num_rows} rows for model training.")

if __name__ == "__main__":
    generate_inventory_json()