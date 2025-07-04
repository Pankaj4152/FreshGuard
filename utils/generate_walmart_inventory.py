import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Define product categories and mappings for mock data generation
categories = ['Beverages', 'Dairy', 'Produce', 'Bakery', 'Meat']
items = {
    'Beverages': ['Juice', 'Soda', 'Milk'],
    'Dairy': ['Cheese', 'Yogurt', 'Butter'],
    'Produce': ['Apple', 'Banana', 'Carrot'],
    'Bakery': ['Bread', 'Bagel', 'Muffin'],
    'Meat': ['Chicken', 'Beef', 'Pork']
}
# Typical shelf life ranges (in days) for each category
shelf_life_ranges = {
    'Beverages': (5, 14),
    'Dairy': (7, 14),
    'Produce': (7, 30),
    'Bakery': (3, 7),
    'Meat': (3, 10)
}
# Storage types per category
category_storage_map = {
    'Beverages': ['ambient', 'refrigerated'],
    'Dairy': ['refrigerated'],
    'Produce': ['ambient', 'refrigerated'],
    'Bakery': ['ambient'],
    'Meat': ['refrigerated', 'frozen']
}
# Temperature and humidity ranges for each storage type
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

def generate_inventory(num_rows=100, output_file="./mock_data/walmart_inventory.json", seed=None):
    """
    Generate mock Walmart inventory data and save to a JSON file.

    Args:
        num_rows (int): Number of inventory rows to generate.
        output_file (str): Path to output JSON file.
        seed (int or None): Random seed for reproducibility.
    """
    if seed is not None:
        np.random.seed(seed)
    data = []
    today = datetime.today()
    for i in range(num_rows):
        # Randomly select category and item
        category = np.random.choice(categories)
        item_name = np.random.choice(items[category])
        # Randomly select storage type and shelf life
        storage_type = np.random.choice(category_storage_map[category])
        shelf_life_days = np.random.randint(*shelf_life_ranges[category])
        # Random arrival date within the last 20 days
        arrival_date = today - timedelta(days=np.random.randint(0, 20))
        expiry_date = arrival_date + timedelta(days=shelf_life_days)
        # Generate storage conditions
        current_temp_c = round(np.random.uniform(*temp_ranges[storage_type]), 1)
        humidity = round(np.random.uniform(*humidity_ranges[storage_type]), 2)
        # Inventory and pricing
        current_stock = np.random.randint(10, 100)
        price_per_unit = round(np.random.uniform(0.99, 19.99), 2)
        # Discount logic based on days to expiry
        days_to_expiry = (expiry_date - today).days
        if days_to_expiry <= 3:
            discount = 50
        elif days_to_expiry <= 7:
            discount = 30
        elif days_to_expiry <= 14:
            discount = 10
        else:
            discount = 0
        # Simulate sales per day
        sales_per_day = np.random.randint(5, 50)
        # Append generated item to data list
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
            "discount": discount,
            "sales_per_day": sales_per_day
        })
    # Convert to DataFrame and save as JSON
    df = pd.DataFrame(data)
    df.to_json(output_file, orient="records", lines=False, indent=2)
    print(f"Generated {output_file} with {num_rows} rows and enhanced features")

def main():
    """
    Interactive CLI for generating inventory data.
    """
    print("Welcome to the Walmart Inventory Generator!")
    try:
        num_rows = int(input("How many inventory rows to generate? [default 100]: ") or 100)
    except ValueError:
        num_rows = 100
    output_file = input("Enter output JSON file name [default walmart_inventory.json]: ") or "walmart_inventory.json"
    seed_input = input("Enter random seed for reproducibility (or leave blank): ")
    seed = int(seed_input) if seed_input.strip() else None
    generate_inventory(num_rows=num_rows, output_file=output_file, seed=seed)

if __name__ == "__main__":
    main()
