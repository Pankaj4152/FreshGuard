# FreshGuard - Smart Inventory Management

🎯 **Complete integration between backend API and frontend React application**

## 🚀 Quick Start

### Windows Users:
1. Double-click `start_backend.bat` to start the backend server
2. Double-click `start_frontend.bat` to start the frontend development server
3. Open http://localhost:3000 in your browser

### Manual Setup:
```bash
# Backend (Terminal 1)
cd backend
pip install -r requirements.txt
cd api
python app.py

# Frontend (Terminal 2)
cd frontend
npm install
npm start
```

### Run Integration Tests:
```bash
python test_integration.py
# or double-click test_integration.bat on Windows
```

## 📁 Project Structure

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
├── INTEGRATION_GUIDE.md              # Detailed testing instructions
├── start_backend.py                  # Cross-platform backend startup
├── start_frontend.py                 # Cross-platform frontend startup
├── test_integration.py               # Automated integration tests
├── start_backend.bat                 # Windows backend startup
├── start_frontend.bat                # Windows frontend startup
├── test_integration.bat              # Windows integration tests
└── README.md                         # This file

## ✨ Features

### Backend API (20+ endpoints)
- 🛒 **Cart Management**: Add, remove, clear, checkout with multi-user support
- 📦 **Inventory Grouping**: Smart categorization and search functionality
- 🔄 **Smart Replacements**: AI-powered suggestions for near-expiry items
- 🎯 **Loyalty System**: Points accumulation and redemption
- 🌱 **Environmental Impact**: Carbon footprint and waste reduction tracking
- 🤖 **ML Predictions**: Shelf life prediction using trained models
- ⚠️ **Expiry Alerts**: Real-time notifications for expiring products
- ⚙️ **Product Thresholds**: Configurable freshness and discount rules

### Frontend React App
- 🎨 **Modern UI**: Responsive design with comprehensive error handling
- 📱 **Smart Cart**: Real-time updates with replacement suggestions
- 📊 **User Dashboard**: Analytics, loyalty points, and impact metrics
- 🔍 **Advanced Search**: Grouped inventory with filtering
- 💡 **Smart Features**: Automated suggestions and ML integration
- 🌐 **Real-time Sync**: Live data updates from backend API

## 🧪 Testing

### Automated Testing
```bash
# Run comprehensive integration tests
python test_integration.py

# Test backend health
curl http://localhost:5000/health

# Test cart operations
curl -X POST http://localhost:5000/add_to_cart \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user1","item_query":"Cheese","quantity":1}'
```

### Manual Testing
1. **Backend**: Start server and visit http://localhost:5000/health
2. **Frontend**: Start dev server and visit http://localhost:3000
3. **Integration**: Test cart, replacements, loyalty, and impact features

## 📚 Documentation

- `INTEGRATION_GUIDE.md` - Comprehensive testing instructions
- `docs/api_reference.md` - Complete API endpoint documentation
- `docs/data_schema.md` - Data structure specifications
- `docs/implementation.markdown` - Technical implementation details

## 🛠️ Development

### Backend Dependencies
- Flask 2.3.3 (API framework)
- Flask-CORS 4.0.0 (Cross-origin requests)
- pandas 2.1.3 (Data manipulation)
- scikit-learn 1.3.2 (Machine learning)
- joblib 1.3.2 (Model serialization)

### Frontend Dependencies
- React 18+ (UI framework)
- Modern JavaScript (ES6+)
- CSS3 with responsive design
- Fetch API for backend communication

## 🎯 Success Criteria

✅ **Backend API**: All 20+ endpoints working with comprehensive error handling  
✅ **Frontend Integration**: Complete React app with real-time backend communication  
✅ **Smart Features**: ML predictions, replacements, loyalty, and impact tracking  
✅ **Error Handling**: Robust fallbacks and user-friendly error messages  
✅ **Testing**: Automated integration tests and manual verification scripts  
✅ **Documentation**: Complete setup and testing instructions  

## 🔧 Troubleshooting

**Backend won't start**: Check Python dependencies and port 5000 availability  
**Frontend build errors**: Ensure Node.js 16+ and run `npm install`  
**API connection issues**: Verify backend is running and check CORS settings  
**Integration problems**: Run `test_integration.py` for detailed diagnostics  

For detailed troubleshooting, see `INTEGRATION_GUIDE.md`