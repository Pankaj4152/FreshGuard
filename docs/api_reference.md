# FreshGuard 2.0 API Reference

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Get Inventory
**GET** `/get_inventory`

Returns the current Walmart inventory with optional filtering.

**Query Parameters:**
- `item_name` (optional): Filter by item name
- `category` (optional): Filter by category
- `expiring_soon` (optional): If true, returns items expiring within 5 days

**Response:**
```json
{
  "inventory": [
    {
      "item_id": "ITEM1001",
      "item_name": "Milk",
      "category": "Dairy",
      "storage_type": "refrigerated",
      "arrival_date": "2025-07-03",
      "expiry_date": "2025-07-10",
      "shelf_life_days": 7,
      "current_temp_c": 4.0,
      "humidity": 0.85,
      "current_stock": 30,
      "price_per_unit": 2.99,
      "discount": 10,
      "sales_per_day": 12
    }
  ]
}
```

### 2. Add to Cart
**POST** `/add_to_cart`

Adds an item to user's cart and checks for near-expiry replacement offers.

**Request Body:**
```json
{
  "user_id": "user123",
  "item_name": "Milk",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart_item": {
    "item_id": "ITEM1001",
    "item_name": "Milk",
    "quantity": 2,
    "price_per_unit": 2.99,
    "added_at": "2025-07-04T18:30:00"
  },
  "offer": {
    "has_replacement": true,
    "item_id": "ITEM1002",
    "discount_percent": 30,
    "loyalty_points": 10,
    "days_to_expiry": 3,
    "message": "Get 30% off and 10 loyalty points for near-expiry Milk!"
  }
}
```

### 3. Remove from Cart
**POST** `/remove_from_cart`

Removes an item from user's cart.

**Request Body:**
```json
{
  "user_id": "user123",
  "item_id": "ITEM1001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 4. Get Cart
**GET** `/cart?user_id=user123`

Returns the user's current cart contents.

**Query Parameters:**
- `user_id` (required): User ID

**Response:**
```json
{
  "user_id": "user123",
  "items": [
    {
      "item_id": "ITEM1001",
      "item_name": "Milk",
      "quantity": 2,
      "price_per_unit": 2.99,
      "added_at": "2025-07-04T18:30:00"
    }
  ],
  "total_items": 2,
  "total_price": 5.98
}
```

### 5. Checkout
**POST** `/checkout`

Processes the cart, updates inventory, and calculates food saved metrics.

**Request Body:**
```json
{
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout completed",
  "transaction": {
    "items_purchased": 2,
    "total_amount": 5.98,
    "loyalty_points_earned": 10,
    "food_saved_kg": 1.5,
    "environmental_impact": "Prevented 0.5kg CO2 emissions"
  }
}
```

### 6. Get Alerts
**GET** `/alerts`

Returns items expiring within 2 days.

**Response:**
```json
{
  "alerts": [
    {
      "item_id": "ITEM1003",
      "item_name": "Chicken",
      "expiry_date": "2025-07-06",
      "days_remaining": 2,
      "current_stock": 25,
      "suggested_discount": 50,
      "priority": "high"
    }
  ],
  "total_alerts": 1
}
```

### 7. Predict Shelf Life
**POST** `/predict_shelf_life`

Predicts shelf life for a new item using the AI model.

**Request Body:**
```json
{
  "item_name": "Yogurt",
  "category": "Dairy",
  "storage_type": "refrigerated",
  "current_temp_c": 4.0,
  "humidity": 0.85,
  "price_per_unit": 1.99,
  "sales_per_day": 15
}
```

**Response:**
```json
{
  "predicted_shelf_life_days": 8,
  "confidence": 0.87,
  "suggested_expiry_date": "2025-07-12"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "error": "Missing required field: user_id",
  "status": 400
}
```

### 404 Not Found
```json
{
  "error": "Item not found in inventory",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to load inventory data",
  "status": 500
}
```

## Authentication

Currently, the API does not require authentication for demo purposes. In production, implement JWT or OAuth2 authentication.

## Rate Limiting

No rate limiting is currently implemented. For production, consider implementing rate limiting to prevent abuse.

## CORS

The API supports CORS for frontend integration. Configure as needed for your domain.
