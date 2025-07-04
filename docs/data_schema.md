# FreshGuard 2.0 Data Schema

## Inventory Data

### File: `backend/mock_api/current_walmart_inventory.json`

**Structure:**
```json
{
  "inventory": [
    {
      "item_id": "string",
      "item_name": "string", 
      "category": "string",
      "storage_type": "string",
      "arrival_date": "YYYY-MM-DD",
      "expiry_date": "YYYY-MM-DD", 
      "shelf_life_days": "integer",
      "current_temp_c": "float",
      "humidity": "float",
      "current_stock": "integer",
      "price_per_unit": "float",
      "discount": "integer",
      "sales_per_day": "integer"
    }
  ]
}
```

**Field Definitions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `item_id` | String | Unique identifier for the item | `"ITEM1001"` |
| `item_name` | String | Product name | `"Milk"` |
| `category` | String | Product category | `"Dairy"` |
| `storage_type` | String | Storage requirement | `"refrigerated"`, `"ambient"`, `"frozen"` |
| `arrival_date` | String (Date) | When item arrived in store | `"2025-07-03"` |
| `expiry_date` | String (Date) | When item expires | `"2025-07-10"` |
| `shelf_life_days` | Integer | Total shelf life in days | `7` |
| `current_temp_c` | Float | Current storage temperature in Celsius | `4.0` |
| `humidity` | Float | Storage humidity (0.0-1.0) | `0.85` |
| `current_stock` | Integer | Units available in stock | `30` |
| `price_per_unit` | Float | Price per unit in USD | `2.99` |
| `discount` | Integer | Current discount percentage | `10` |
| `sales_per_day` | Integer | Average daily sales | `12` |

**Category Values:**
- `"Beverages"`
- `"Dairy"`
- `"Produce"`
- `"Bakery"`
- `"Meat"`

**Storage Type Values:**
- `"ambient"` (room temperature, 15-25°C)
- `"refrigerated"` (cold storage, 2-8°C)
- `"frozen"` (frozen storage, -18 to -10°C)

---

## Cart Data

### File: `backend/mock_api/users_cart.json`

**Structure:**
```json
{
  "user_id": {
    "item_id": {
      "item_name": "string",
      "quantity": "integer",
      "price_per_unit": "float",
      "added_at": "ISO datetime string"
    }
  }
}
```

**Example:**
```json
{
  "user123": {
    "ITEM1001": {
      "item_name": "Milk",
      "quantity": 2,
      "price_per_unit": 2.99,
      "added_at": "2025-07-04T18:30:00"
    },
    "ITEM1002": {
      "item_name": "Bread",
      "quantity": 1,
      "price_per_unit": 1.99,
      "added_at": "2025-07-04T18:32:00"
    }
  },
  "user456": {
    "ITEM1003": {
      "item_name": "Chicken",
      "quantity": 1,
      "price_per_unit": 6.99,
      "added_at": "2025-07-04T19:15:00"
    }
  }
}
```

**Field Definitions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `user_id` | String | Unique user identifier | `"user123"` |
| `item_id` | String | Reference to inventory item | `"ITEM1001"` |
| `item_name` | String | Product name (for quick reference) | `"Milk"` |
| `quantity` | Integer | Number of units in cart | `2` |
| `price_per_unit` | Float | Price per unit when added to cart | `2.99` |
| `added_at` | String (ISO DateTime) | When item was added to cart | `"2025-07-04T18:30:00"` |

---

## Training Data

### File: `backend/models/data/walmart_inventory.json`

Same structure as inventory data above, used for training the shelf life prediction model.

**Key Features for ML Model:**
- **Target Variable:** `shelf_life_days`
- **Input Features:** `item_name`, `category`, `storage_type`, `current_temp_c`, `humidity`, `price_per_unit`, `sales_per_day`

---

## Model Files

### Saved Model Artifacts:

| File | Description |
|------|-------------|
| `shelf_life_predictor_rf.joblib` | Trained RandomForest model |
| `shelf_life_predictor_rf_encoders.joblib` | LabelEncoders for categorical features |
| `shelf_life_predictor_rf_columns.joblib` | Feature column order for prediction |

**Model Input Schema:**
```python
{
    "item_name": "string",      # Encoded using LabelEncoder
    "category": "string",       # Encoded using LabelEncoder  
    "storage_type": "string",   # Encoded using LabelEncoder
    "current_temp_c": "float",  # Numeric feature
    "humidity": "float",        # Numeric feature
    "price_per_unit": "float",  # Numeric feature
    "sales_per_day": "integer"  # Numeric feature
}
```

**Model Output:**
- **Type:** Integer
- **Description:** Predicted shelf life in days
- **Range:** Typically 1-30 days depending on product type

---

## API Request/Response Schemas

### Add to Cart Request:
```json
{
  "user_id": "string (required)",
  "item_name": "string (required)", 
  "quantity": "integer (optional, default: 1)"
}
```

### Cart Response:
```json
{
  "user_id": "string",
  "items": [
    {
      "item_id": "string",
      "item_name": "string",
      "quantity": "integer",
      "price_per_unit": "float",
      "added_at": "string (ISO datetime)"
    }
  ],
  "total_items": "integer",
  "total_price": "float"
}
```

### Alert Response:
```json
{
  "alerts": [
    {
      "item_id": "string",
      "item_name": "string", 
      "expiry_date": "string (YYYY-MM-DD)",
      "days_remaining": "integer",
      "current_stock": "integer",
      "suggested_discount": "integer",
      "priority": "string (low|medium|high)"
    }
  ],
  "total_alerts": "integer"
}
```

---

## Data Validation Rules

### Inventory:
- `item_id`: Must be unique, format: `ITEM[0-9]{4}`
- `shelf_life_days`: Must be positive integer, typically 1-30
- `current_temp_c`: Must match storage_type ranges
- `humidity`: Must be between 0.0 and 1.0
- `current_stock`: Must be non-negative integer
- `price_per_unit`: Must be positive float
- `discount`: Must be 0-100 integer

### Cart:
- `quantity`: Must be positive integer
- `price_per_unit`: Must match inventory price at time of addition
- `added_at`: Must be valid ISO datetime string

### Model Input:
- All categorical fields must exist in training data encoders
- Numeric fields must be within reasonable ranges
- Missing values handled by defaulting to 0 or mean values
