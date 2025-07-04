# FreshGuard 2.0: Technical Implementation

## Folder Structure

```text
freshguard-2.0/
├── backend/
│   ├── mock_api/
│   │   ├── current_walmart_inventory.json
│   │   └── users_cart.json
│   ├── models/
│   │   ├── data/
│   │   │   └── walmart_inventory.json
│   │   ├── shelf_life_predictor_rf.joblib
│   │   ├── shelf_life_predictor_rf_encoders.joblib
│   │   ├── shelf_life_predictor_rf_columns.joblib
│   │   ├── generate_walmart_inventory.py
│   │   └── predict_expiry.py
│   ├── scripts/
│   │   ├── generate_walmart_inventory.py
│   │   ├── train_shelf_life_model.py
│   │   ├── predict_shelf_life.py
│   │   ├── cart_manage.py
│   │   ├── cart_cli.py
│   │   └── update_stock.py
│   ├── api/
│   │   └── app.py
│   ├── requirements.txt
│   └── config.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Inventory.js
│   │   │   ├── Alerts.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── package.json
│   └── tailwind.config.js
├── docs/
│   ├── implementation.markdown
│   ├── workflow.png
│   ├── workflow.mmd
│   ├── demo_outline.md
│   ├── pitch.md
│   ├── api_reference.md
│   ├── data_schema.md
│   └── README_shelf_life_model.md
├── tests/
│   ├── test_endpoints.py
│   ├── test_model.py
│   └── test_data.json
├── .gitignore
├── README.md
└── setup.sh
```

---

## Backend Overview

- **Framework:** Flask (`backend/api/app.py`)
- **Endpoints:**  
  - `GET /get_inventory` — List inventory items (with optional filters)
  - `POST /add_to_cart` — Add item to cart, predict shelf life, suggest near-expiry replacements
  - `POST /remove_from_cart` — Remove item from cart
  - `GET /cart` — Get user cart contents
  - `POST /checkout` — Update inventory, calculate food saved
  - `GET /alerts` — Items expiring soon (≤2 days)

- **Dependencies:**  
  Install with:
  ```bash
  pip install -r backend/requirements.txt
  ```
  Required packages:
  ```
  pandas
  numpy<2
  scikit-learn
  joblib
  flask
  ```

---

## AI Model Training

### Files:
- `backend/scripts/train_shelf_life_model.py` — Train shelf life prediction model
- `backend/scripts/predict_shelf_life.py` — CLI for shelf life prediction
- `backend/models/predict_expiry.py` — Model prediction module for API

### Process:
1. **Generate Training Data:**
   ```bash
   python backend/scripts/generate_walmart_inventory.py
   ```
2. **Train Model:**
   ```bash
   python backend/scripts/train_shelf_life_model.py
   ```
3. **Test Prediction:**
   ```bash
   python backend/scripts/predict_shelf_life.py
   ```

### Model Details:
- **Algorithm:** RandomForestRegressor
- **Target:** `shelf_life_days` (how long item stays fresh)
- **Features:** `item_name`, `category`, `storage_type`, `current_temp_c`, `humidity`, `price_per_unit`, `sales_per_day`
- **Encoding:** LabelEncoder for categorical features
- **Output:** Saved as `shelf_life_predictor_rf.joblib` with encoders and column info

---

## Data Flow

### Inventory Data:
- **Real-time:** `backend/mock_api/current_walmart_inventory.json`
- **Training:** `backend/models/data/walmart_inventory.json`
- **Structure:** Items with `item_id`, `item_name`, `category`, `storage_type`, `expiry_date`, `current_stock`, etc.

### Cart Data:
- **File:** `backend/mock_api/users_cart.json`
- **Structure:** Multi-user cart with nested items by user_id and item_id
- **Format:**
  ```json
  {
    "user101": {
      "ITEM1001": {
        "item_name": "Milk",
        "quantity": 2,
        "price_per_unit": 2.99,
        "added_at": "2025-07-04T18:30:00"
      }
    }
  }
  ```

### Model Files:
- `backend/models/shelf_life_predictor_rf.joblib` — Trained model
- `backend/models/shelf_life_predictor_rf_encoders.joblib` — Categorical encoders
- `backend/models/shelf_life_predictor_rf_columns.joblib` — Feature column order

---

## CLI Tools

### Inventory Management:
```bash
# Generate mock inventory data
python backend/scripts/generate_walmart_inventory.py

# Update inventory stock
python backend/scripts/update_stock.py
```

### Cart Management:
```bash
# Interactive cart management
python backend/scripts/cart_cli.py
```

### Model Operations:
```bash
# Train new model
python backend/scripts/train_shelf_life_model.py

# Test predictions
python backend/scripts/predict_shelf_life.py
```

---

## Frontend Overview

- **Framework:** React + Tailwind CSS
- **Key Components:**  
  - `Inventory.js` — List items, add to cart, show near-expiry offers
  - `Alerts.js` — Show expiry alerts for items ≤2 days
  - `Dashboard.js` — Show food saved metrics and charts
- **API Integration:**  
  Uses Axios to call Flask backend endpoints
- **Styling:** Tailwind CSS for modern, responsive UI

---

## Workflow

### User Cart Workflow:
1. User views inventory and selects item
2. System predicts shelf life using AI model
3. System scans for near-expiry replacements (expiry ≤5 days)
4. If replacement found: Show discount and loyalty points offer
5. User accepts/rejects offer
6. Item added to cart with appropriate pricing
7. Checkout updates inventory and calculates food saved

### Data Processing:
- Inventory → AI Model → Shelf Life Prediction
- Cart Items → Replacement Scanner → Discount/Points Calculation
- Purchase → Inventory Update → Food Waste Metrics

---

## API Integration

All backend functions are designed to be easily integrated into Flask API endpoints:

- **Cart functions** (`backend/scripts/cart_manage.py`) → `/add_to_cart`, `/remove_from_cart`, `/cart`
- **Inventory functions** → `/get_inventory`, `/update_stock`
- **Model prediction** (`backend/models/predict_expiry.py`) → `/predict_shelf_life`
- **Alert generation** → `/alerts`

---

## Testing & Development

### CLI Testing:
- Use `cart_cli.py` for testing cart operations
- Use `predict_shelf_life.py` for testing model predictions
- Use `generate_walmart_inventory.py` for creating test data

### API Testing:
- Unit tests in `tests/test_endpoints.py`
- Model tests in `tests/test_model.py`
- Sample data in `tests/test_data.json`

---

## Documentation Files

- **Main Implementation:** `docs/implementation.markdown` (this file)
- **API Reference:** `docs/api_reference.md` — Full endpoint documentation
- **Data Schema:** `docs/data_schema.md` — JSON/CSV field definitions
- **Workflow Diagram:** `docs/workflow.png` — Visual process flow
- **Demo Plan:** `docs/demo_outline.md` — Step-by-step demo for judges
- **Pitch:** `docs/pitch.md` — Hackathon presentation outline
- **Model Details:** `docs/README_shelf_life_model.md` — ML model documentation

---

## Setup & Deployment

### Local Development:
1. Install dependencies: `pip install -r backend/requirements.txt`
2. Generate test data: `python backend/scripts/generate_walmart_inventory.py`
3. Train model: `python backend/scripts/train_shelf_life_model.py`
4. Test CLI: `python backend/scripts/cart_cli.py`
5. Start API: `python backend/api/app.py`
6. Start frontend: `npm start` (in frontend directory)

### Production Considerations:
- Use environment variables for file paths (`config.py`)
- Handle model loading errors gracefully
- Implement proper logging and error handling
- Use absolute paths for deployment
- Consider Docker containerization

---

## Team Roles

- **Backend Development:** API endpoints, data management
- **AI/ML Engineering:** Model training, prediction algorithms
- **Frontend Development:** React components, user interface
- **Testing & Documentation:** Quality assurance, documentation

---

## Timeline (July 4-14, 2025)

- **Days 1-3:** Backend infrastructure, model training, CLI tools
- **Days 4-6:** API development, frontend components
- **Days 7-8:** Integration, testing, refinement
- **Days 9-10:** Demo preparation, documentation finalization