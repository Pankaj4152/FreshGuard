# FreshGuard 2.0 - Integration Test Guide

## 🎯 Quick Start

This guide will help you test the complete FreshGuard 2.0 integration between the backend API and frontend React application.

## 📋 Prerequisites

1. **Python 3.8+** with pip
2. **Node.js 16+** with npm
3. **Web browser** for frontend testing

## 🚀 Step-by-Step Testing

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server

**Option A: Using the startup script**
```bash
python start_backend.py
```

**Option B: Manual startup**
```bash
cd backend/api
python app.py
```

**Expected Output:**
- Server starts on http://localhost:5000
- Displays available endpoints and features
- Shows feature availability status

### 3. Test Backend API

**Option A: Using the integration test script**
```bash
# In a new terminal window
python test_integration.py
```

**Option B: Manual testing**
```bash
# Health check
curl http://localhost:5000/health

# Get inventory
curl http://localhost:5000/get_inventory

# Test cart operations
curl -X POST http://localhost:5000/add_to_cart \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user1","item_query":"Cheese","quantity":1}'
```

### 4. Start Frontend Development Server

**Option A: Using the startup script**
```bash
# In a new terminal window
python start_frontend.py
```

**Option B: Manual startup**
```bash
cd frontend
npm install  # First time only
npm start
```

**Expected Output:**
- React development server starts on http://localhost:3000
- Browser opens automatically
- No compilation errors

### 5. Test Frontend Integration

1. **Open browser**: Navigate to http://localhost:3000
2. **Test main pages**:
   - Home page with product catalog
   - Cart page with add/remove functionality
   - Dashboard with user stats and loyalty points
   - Alerts page with expiring items

3. **Test key features**:
   - Add items to cart
   - View smart replacement suggestions
   - Check loyalty points accumulation
   - Monitor environmental impact
   - Browse grouped inventory

## 🧪 Automated Test Results

When running `python test_integration.py`, you should see:

```
✅ Backend server is healthy
✅ /get_inventory - OK
✅ /get_grouped_inventory - OK
✅ Add to cart - OK
✅ Get cart - OK
✅ /get_replacement_suggestions - OK
✅ /get_loyalty_points - OK
✅ Frontend files - Found
🎉 FreshGuard 2.0 Integration Complete!
```

## 🔧 Troubleshooting

### Backend Issues

**Server won't start:**
- Check Python dependencies: `pip install -r backend/requirements.txt`
- Verify Flask installation: `python -c "import flask; print(flask.__version__)"`
- Check port availability: Ensure port 5000 is not in use

**Import errors:**
- Ensure you're in the correct directory
- Check that all script files exist in `backend/scripts/`
- Verify mock data files exist in `backend/mock_api/`

### Frontend Issues

**Build errors:**
- Install dependencies: `cd frontend && npm install`
- Clear cache: `npm start -- --reset-cache`
- Check Node.js version: `node --version` (should be 16+)

**API connection issues:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API endpoints in `src/services/api.js`

## 📊 Feature Checklist

### Backend API (20+ endpoints)
- ✅ Cart management (add, remove, clear, checkout)
- ✅ Inventory grouping and search
- ✅ Smart replacement suggestions
- ✅ Loyalty points system
- ✅ Environmental impact tracking
- ✅ ML-powered shelf life predictions
- ✅ Expiry alerts and notifications
- ✅ Product threshold configuration

### Frontend React App
- ✅ Modern responsive design
- ✅ Smart cart management
- ✅ Real-time inventory updates
- ✅ User dashboard with analytics
- ✅ Interactive replacement suggestions
- ✅ Loyalty points visualization
- ✅ Environmental impact metrics
- ✅ Comprehensive error handling

### Integration
- ✅ Complete API integration
- ✅ Real-time data synchronization
- ✅ Error handling and fallbacks
- ✅ Performance optimization
- ✅ Cross-browser compatibility

## 🎉 Success Criteria

Your FreshGuard 2.0 integration is successful if:

1. Backend server starts without errors
2. All API endpoints respond correctly
3. Frontend builds and runs without errors
4. All major features work in the browser
5. Data flows correctly between frontend and backend
6. Smart features (replacements, ML, loyalty) function properly

## 📞 Support

If you encounter any issues:
1. Check the console/terminal output for error messages
2. Verify all dependencies are installed
3. Ensure both servers are running on the correct ports
4. Check the browser developer console for frontend errors

The system is designed to be robust with comprehensive error handling and fallbacks throughout.
