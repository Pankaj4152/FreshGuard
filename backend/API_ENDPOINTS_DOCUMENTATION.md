# FreshGuard 2.0 - Complete API Endpoints Documentation

## Overview
This document provides comprehensive documentation for all FreshGuard 2.0 API endpoints. All endpoints return JSON responses with consistent error handling and debugging information.

## Base URL
```
http://localhost:5000
```

## Response Format
All endpoints follow this response format:
```json
{
  "success": true/false,
  "data": {},
  "error": "Error message if applicable",
  "timestamp": "ISO timestamp for debugging"
}
```

---

## 🏠 Core System Endpoints

### GET `/` - API Information
Health check and feature availability.

**Response:**
```json
{
  "success": true,
  "message": "FreshGuard 2.0 API is running!",
  "version": "2.0",
  "features": {
    "grouped_inventory": true,
    "smart_replacement": true,
    "fresh_item_selection": true,
    "ml_prediction": true,
    "product_thresholds": true,
    "loyalty_system": true,
    "impact_tracking": true
  },
  "endpoints": ["array of all available endpoints"]
}
```

### GET `/health` - Health Check
Comprehensive system health check with feature status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-07-06T10:30:00Z",
  "features": {
    "inventory_loading": true,
    "cart_system": true,
    "loyalty_system": true,
    "product_thresholds": true,
    "grouping_available": true,
    "ml_available": true
  },
  "stats": {
    "inventory_items": 75,
    "configured_thresholds": 10,
    "user_loyalty_records": 5
  }
}
```

---

## 📦 Inventory Management

### GET `/get_inventory` - Get Inventory
Get all inventory items with optional filtering and grouping.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `expiring_soon` (boolean, optional): Show only items expiring ≤2 days
- `grouped` (boolean, optional, default: true): Use grouped display

**Response:**
```json
{
  "success": true,
  "inventory": [
    {
      "item_id": "ITEM_001",
      "item_name": "Cheese",
      "category": "Dairy",
      "price_per_unit": 3.99,
      "current_stock": 25,
      "expiry_date": "2025-07-12",
      "effective_discount": 15,
      "discounted_price": 3.39
    }
  ],
  "count": 75,
  "grouped": true
}
```

### GET `/get_grouped_inventory` - Get Grouped Inventory
Get inventory grouped by product name with fresh/near-expiry separation.

**Query Parameters:**
- `near_expiry_threshold` (int, optional, default: 5): Days threshold for near-expiry

**Response:**
```json
{
  "success": true,
  "grouped_products": {
    "Cheese": {
      "fresh_items": [array of fresh items],
      "near_expiry_items": [array of near-expiry items],
      "best_item": {best item object},
      "display_info": {summary for display}
    }
  },
  "all_grouped": [array of grouped display items],
  "total_products": 25,
  "grouping_enabled": true
}
```

### GET `/get_product_details` - Get Product Details
Get detailed information about a product including all variants.

**Query Parameters:**
- `product_name` (string, required): Name of the product

**Response:**
```json
{
  "success": true,
  "product": {
    "product_name": "Cheese",
    "total_variants": 3,
    "in_stock_variants": 2,
    "total_stock": 45,
    "price_range": {"min": 2.99, "max": 4.99},
    "expiry_range": {"earliest": "2025-07-08", "latest": "2025-07-15"},
    "has_near_expiry": true,
    "all_items": [array of all variants],
    "in_stock_items": [array of in-stock variants]
  }
}
```

### GET `/inventory_items_for_product` - Get Product Variants
Get all inventory items for a specific product name.

**Query Parameters:**
- `product_name` (string, required): Name of the product

**Response:**
```json
{
  "success": true,
  "product_name": "Cheese",
  "items": [
    {
      "item_id": "CHEESE_001",
      "item_name": "Cheese",
      "expiry_date": "2025-07-10",
      "days_until_expiry": 4,
      "is_near_expiry": true,
      "is_critical": false
    }
  ],
  "total_items": 3,
  "in_stock_items": 2,
  "near_expiry_count": 1,
  "critical_count": 0
}
```

---

## 🛒 Cart Management

### POST `/add_to_cart` - Add to Cart
Add item to cart with replacement suggestion.

**Request Body:**
```json
{
  "user_id": "user1",
  "item_query": "Cheese",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "item_added": {item object},
  "replacement": null,
  "loyalty_points_earned": 2
}
```

### POST `/add_replacement_to_cart` - Add Replacement
Add replacement item to cart.

**Request Body:**
```json
{
  "user_id": "user1",
  "replacement": {replacement item object},
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Replacement item added to cart",
  "loyalty_points_earned": 10,
  "bonus_points": true
}
```

### POST `/remove_from_cart` - Remove from Cart
Remove item from cart.

**Request Body:**
```json
{
  "user_id": "user1",
  "item_id": "ITEM_001",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### GET `/get_cart` - Get Cart
Get user's cart contents.

**Query Parameters:**
- `user_id` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "user_id": "user1",
  "cart": [
    {
      "item_id": "ITEM_001",
      "item_name": "Cheese",
      "quantity": 2,
      "price_per_unit": 3.99,
      "subtotal": 7.98,
      "loyalty_points": 2,
      "discount_given": 0
    }
  ],
  "items": [same as cart],
  "total": 7.98,
  "count": 1
}
```

### POST `/clear_cart` - Clear Cart
Clear user's cart.

**Request Body:**
```json
{
  "user_id": "user1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

### POST `/checkout` - Checkout
Checkout user's cart.

**Request Body:**
```json
{
  "user_id": "user1",
  "clear_cart": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout successful",
  "cart_items": [array of purchased items],
  "total_price": 15.97,
  "total_value": 15.97,
  "loyalty_points": 150,
  "loyalty_points_earned": 4,
  "points_earned": 4,
  "total_items": 4,
  "environmental_impact": {
    "food_saved_kg": 2.0,
    "co2_saved_kg": 5.0,
    "items_rescued": 4
  }
}
```

---

## 🔄 Smart Features

### POST `/suggest_replacements` - Get Replacements
Get replacement suggestions for a product (near-expiry items only).

**Request Body:**
```json
{
  "product_name": "Cheese",
  "near_expiry_threshold": 5
}
```

**Response:**
```json
{
  "success": true,
  "product_name": "Cheese",
  "replacements": [
    {
      "item_id": "CHEESE_002",
      "item_name": "Cheese",
      "expiry_date": "2025-07-08",
      "days_until_expiry": 2,
      "replacement_type": "near_expiry",
      "urgency_level": "critical",
      "suggested_message": "Expires within 2 days - Buy only if you can use it quickly",
      "is_replacement": true
    }
  ],
  "count": 1,
  "threshold_days": 5
}
```

### POST `/suggest_cart_item` - Suggest Cart Item
Suggest the best item for adding to cart with replacement options.

**Request Body:**
```json
{
  "product_name": "Cheese"
}
```

**Response:**
```json
{
  "success": true,
  "product_name": "Cheese",
  "best_item": {best item object},
  "warning": null,
  "incentive": null,
  "replacements": [array of near-expiry alternatives],
  "replacement_count": 2
}
```

### POST `/find_freshest_item` - Find Freshest
Find the freshest available item for a product.

**Request Body:**
```json
{
  "product_name": "Cheese",
  "min_days_threshold": 3
}
```

**Response:**
```json
{
  "success": true,
  "product_name": "Cheese",
  "freshest_item": {freshest item object},
  "days_until_expiry": 8,
  "meets_threshold": true
}
```

---

## 👤 User & Loyalty System

### GET `/get_loyalty` - Get Loyalty Points
Get user's loyalty points.

**Query Parameters:**
- `user_id` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "user_id": "user1",
  "loyalty_points": 125,
  "points": 125
}
```

### POST `/add_loyalty_points` - Add Loyalty Points
Add loyalty points to a user.

**Request Body:**
```json
{
  "user_id": "user1",
  "points": 10
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user1",
  "points_added": 10,
  "total_loyalty_points": 135
}
```

### GET `/user_impact` - User Impact
Get user's sustainability impact metrics.

**Query Parameters:**
- `user_id` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "user_id": "user1",
  "impact": {
    "items_saved": 15,
    "food_saved_kg": 7.5,
    "co2_saved_kg": 18.75,
    "money_saved": 37.5,
    "loyalty_points": 125,
    "level": "Bronze",
    "total_orders": 5
  }
}
```

### POST `/update_impact_dash` - Update Impact Dashboard
Update user's impact dashboard metrics.

**Request Body:**
```json
{
  "user_id": "user1",
  "total_food_saved": 2.5,
  "total_money_saved": 10.0,
  "total_co2_reduced": 6.25,
  "total_loyalty_points": 10,
  "total_orders": 1,
  "total_items": 3,
  "update_type": "add"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user1",
  "updated_metrics": {complete updated metrics object},
  "update_type": "add"
}
```

---

## 🚨 Alerts & Predictions

### GET `/get_alerts` - Get Alerts
Get items expiring soon (≤2 days).

**Query Parameters:**
- `user_id` (string, optional): User ID
- `days` (int, optional, default: 2): Days threshold

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "item_id": "ITEM_001",
      "item_name": "Cheese",
      "expiry_date": "2025-07-08",
      "days_left": 2,
      "effective_discount": 20,
      "discounted_price": 3.19,
      "current_stock": 5
    }
  ],
  "count": 1,
  "days_threshold": 2
}
```

### POST `/predict_shelf_life` - Predict Shelf Life (Rule-based)
Predict shelf life for a given item using rule-based logic.

**Request Body:**
```json
{
  "item_name": "Yogurt",
  "category": "Dairy",
  "storage_type": "refrigerated"
}
```

**Response:**
```json
{
  "success": true,
  "item_name": "Yogurt",
  "predicted_shelf_life_days": 7,
  "storage_type": "refrigerated",
  "category": "Dairy"
}
```

### POST `/enhanced_predict_shelf_life` - ML Prediction
Enhanced shelf life prediction using ML model if available.

**Request Body:**
```json
{
  "item_name": "Yogurt",
  "category": "Dairy",
  "storage_type": "refrigerated",
  "current_temp_c": 4.0,
  "humidity": 0.85,
  "price_per_unit": 1.99,
  "current_stock": 20,
  "sales_per_day": 15
}
```

**Response:**
```json
{
  "success": true,
  "item_name": "Yogurt",
  "category": "Dairy",
  "predicted_shelf_life_days": 8,
  "prediction_method": "ml_model",
  "sample_data": {input data used for prediction}
}
```

### POST `/days_until_expiry` - Calculate Expiry Days
Calculate days until expiry for a given date.

**Request Body:**
```json
{
  "expiry_date": "2025-07-12"
}
```

**Response:**
```json
{
  "success": true,
  "expiry_date": "2025-07-12",
  "days_until_expiry": 6,
  "is_expired": false,
  "is_near_expiry": false,
  "is_critical": false,
  "urgency_level": "safe"
}
```

---

## ⚙️ Configuration

### GET `/load_product_thresholds` - Load Thresholds
Load product expiry thresholds configuration.

**Response:**
```json
{
  "success": true,
  "thresholds": {
    "cheese": {"min_days_for_cart": 5},
    "milk": {"min_days_for_cart": 20},
    "bread": {"min_days_for_cart": 3}
  },
  "total_configured": 10
}
```

### GET `/get_product_threshold` - Get Product Threshold
Get threshold configuration for a specific product.

**Query Parameters:**
- `product_name` (string, required): Product name

**Response:**
```json
{
  "success": true,
  "product_name": "cheese",
  "threshold": {
    "min_days_for_cart": 5
  }
}
```

---

## 🧪 Testing & Debug

### POST `/test_functions` - Test Functions
Test all cart functions for a user (for debugging).

**Request Body:**
```json
{
  "user_id": "test_user"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "test_user",
  "test_output": "Complete test output from all function tests",
  "message": "All functions tested successfully"
}
```

---

## Error Handling

### Error Response Format
All errors follow this format:
```json
{
  "success": false,
  "error": "Detailed error message",
  "status_code": 400,
  "timestamp": "2025-07-06T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (endpoint or resource not found)
- `500` - Internal Server Error

### 404 Response
Includes list of available endpoints:
```json
{
  "success": false,
  "error": "Endpoint not found",
  "status_code": 404,
  "timestamp": "2025-07-06T10:30:00Z",
  "available_endpoints": ["array of all available endpoints"]
}
```

---

## Frontend Integration Notes

### Authentication
Currently using simple user_id strings. In production, implement proper authentication.

### Error Handling
Always check the `success` field in responses. Use `error` field for user messaging.

### Loading States
Use the `/health` endpoint to check feature availability before using advanced features.

### Debugging
- Use `/health` for system status
- Use `/test_functions` for function testing
- Check console logs for detailed error information

### Best Practices
1. Always validate required parameters before sending requests
2. Handle both success and error responses
3. Use appropriate HTTP methods (GET for reading, POST for mutations)
4. Cache frequently accessed data like inventory and thresholds
5. Implement retry logic for network failures

---

## Examples for Frontend

### React/JavaScript Example
```javascript
// Add item to cart with error handling
const addToCart = async (userId, itemName, quantity) => {
  try {
    const response = await fetch('/add_to_cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        item_query: itemName,
        quantity: quantity
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Item added:', result.message);
      if (result.replacement) {
        // Show replacement modal
        showReplacementOffer(result.replacement);
      }
    } else {
      console.error('Error:', result.error);
      showError(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Network error:', error);
    showError('Network error occurred');
    return { success: false, error: error.message };
  }
};
```

This documentation provides everything needed for seamless frontend integration with comprehensive error handling and debugging capabilities.
