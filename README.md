# FreshGuard


freshguard-2.0/
├── backend/
│   ├── api/
│   │   └── app.py                        # Flask backend (API endpoints)
│   ├── mock_api/
│   │   ├── current_walmart_inventory.json # Real-time inventory (used by backend)
│   │   └── users_cart.json                # User cart data (multi-user)
│   ├── models/
│   │   ├── shelf_life_model.joblib        # Trained ML model
│   │   ├── shelf_life_model_encoders.joblib
│   │   ├── shelf_life_model_columns.joblib
│   │   ├── data/
│   │   │   └── food_data.csv              # Training data for shelf life model
│   │   ├── convert_json_to_csv.py         # Converts inventory JSON to CSV
│   │   ├── generate_food_data.py          # Generates synthetic training data
│   │   └── predict_expiry.py              # Model training and prediction
│   ├── scripts/
│   │   ├── generate_walmart_inventory.py  # Script to generate inventory
│   │   ├── cart_manage.py                 # CLI for cart management
│   │   ├── train_shelf_life_model.py      # CLI for model training
│   │   ├── predict_shelf_life.py          # CLI for shelf life prediction
│   │   └── update_stock.py                # CLI for inventory updates
│   ├── requirements.txt                   # Backend dependencies
│   └── config.py                          # Config (Firebase, file paths, etc.)
│
├── frontend/
│   ├── public/
│   │   ├── index.html                     # React HTML template
│   │   └── favicon.ico                    # App favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Inventory.js               # Inventory UI
│   │   │   ├── Alerts.js                  # Expiry alerts UI
│   │   │   └── Dashboard.js               # Food saved metrics (Chart.js)
│   │   ├── App.js                         # Main React app
│   │   ├── App.css                        # Tailwind CSS styles
│   │   └── index.js                       # React entry point
│   ├── package.json                       # Frontend dependencies
│   └── tailwind.config.js                 # Tailwind CSS config
│
├── docs/
│   ├── workflow.xml                       # Draw.io workflow diagram
│   ├── workflow.png                       # Exported workflow image
│   ├── demo_outline.md                    # Demo plan
│   └── pitch.md                           # Presentation outline
│
├── tests/
│   ├── test_endpoints.py                  # Flask endpoint tests
│   ├── test_model.py                      # Model tests
│   └── test_data.json                     # Test data
│
├── .gitignore                             # Ignore node_modules, __pycache__, .joblib, etc.
├── README.md                              # Project overview and setup
└── setup.sh                               # Environment setup script