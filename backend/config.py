import os

class Config:
    # File paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INVENTORY_FILE = os.path.join(BASE_DIR, "mock_api", "current_walmart_inventory.json")
    CART_FILE = os.path.join(BASE_DIR, "mock_api", "users_cart.json")
    LOYALTY_FILE = os.path.join(BASE_DIR, "mock_api", "loyalty_points.json")
    
    # API Configuration
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')