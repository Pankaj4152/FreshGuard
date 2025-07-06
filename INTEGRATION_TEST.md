# FreshGuard 2.0 - Integration Test Checklist

## 🎯 System Overview
- ✅ Backend API with 20+ endpoints for cart, replacement, grouping, ML, loyalty, and impact features
- ✅ Frontend React app with smart inventory, cart management, and user dashboard
- ✅ Complete integration between frontend and backend via REST API
- ✅ Error handling, fallbacks, and debug modes throughout

## 🔧 Backend Testing

### 1. Start Backend Server
```bash
cd backend/api
python app.py
```
**Expected:** Server starts on http://localhost:5000 with detailed endpoint listing

### 2. Health Check
```bash
curl http://localhost:5000/health
```
**Expected:** JSON response with feature availability and system stats

### 3. Test Core Endpoints
```bash
# Get inventory
curl http://localhost:5000/get_inventory

# Get grouped inventory  
curl http://localhost:5000/get_grouped_inventory

# Test cart operations
curl -X POST http://localhost:5000/add_to_cart \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user1","item_query":"Cheese","quantity":1}'

curl http://localhost:5000/get_cart?user_id=user1
```

## 🎨 Frontend Testing

### 1. Install Dependencies & Build
```bash
cd frontend
npm install
npm run build
```
**Expected:** Clean build with no compilation errors

### 2. Start Development Server
```bash
npm start
```
**Expected:** Server starts on http://localhost:3000

### 3. Navigation Test
- ✅ Home page loads with featured products
- ✅ Inventory page shows product grid with filters
- ✅ Cart page displays user's cart items
- ✅ Dashboard shows user impact metrics
- ✅ Checkout process works end-to-end

## 🔄 Integration Testing

### 1. Inventory & Product Discovery
- [ ] Products load from backend API
- [ ] Search and filtering work correctly
- [ ] Smart grouping toggle functions
- [ ] Product cards display correctly with prices, discounts, urgency

### 2. Cart Operations
- [ ] Add to cart works with smart suggestions
- [ ] Replacement modal appears for better alternatives
- [ ] Remove from cart updates quantities
- [ ] Clear cart empties all items
- [ ] Cart totals calculate correctly

### 3. Smart Features
- [ ] Replacement suggestions appear for near-expiry items
- [ ] Smart cart suggestions recommend best options
- [ ] Environmental impact preview shows
- [ ] Loyalty points accumulate properly

### 4. Checkout & Loyalty
- [ ] Checkout process completes successfully
- [ ] Loyalty points are awarded
- [ ] Environmental impact is tracked
- [ ] Order history is maintained

### 5. User Dashboard
- [ ] Impact metrics display correctly
- [ ] Loyalty points show current total
- [ ] Charts and visualizations render
- [ ] User level and achievements visible

## 🐛 Error Handling Testing

### 1. Backend Errors
- [ ] Invalid requests return proper error messages
- [ ] Missing parameters are caught and reported
- [ ] Import failures have fallback functionality
- [ ] Database errors are handled gracefully

### 2. Frontend Errors
- [ ] API failures show user-friendly messages
- [ ] Loading states display during operations
- [ ] Toast notifications appear for success/error
- [ ] Network issues are handled properly

## 🚀 Performance & UX

### 1. Loading Performance
- [ ] Initial page load is fast
- [ ] API responses are quick
- [ ] Images and assets load properly
- [ ] Smooth transitions between pages

### 2. User Experience
- [ ] Intuitive navigation
- [ ] Clear call-to-action buttons
- [ ] Helpful error messages
- [ ] Responsive design works on mobile

## 📊 Advanced Features Testing

### 1. ML & Predictions
- [ ] Shelf life predictions work (if ML model available)
- [ ] Sensor data integration functions
- [ ] Smart recommendations improve over time

### 2. Sustainability Features
- [ ] Environmental impact calculations are accurate
- [ ] CO2 and food waste metrics make sense
- [ ] Sustainability messages are meaningful

### 3. Loyalty & Gamification
- [ ] Points system encourages good behavior
- [ ] Achievements unlock at appropriate milestones
- [ ] Leaderboard and social features work

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

**Backend won't start:**
- Ensure Python dependencies are installed: `pip install flask flask-cors`
- Check that all backend files exist in correct locations
- Verify Python path can find scripts directory

**Frontend compilation errors:**
- Run `npm install` to ensure dependencies are installed
- Check that all component imports are correct
- Verify API service baseURL points to backend

**API connection fails:**
- Ensure backend is running on http://localhost:5000
- Check browser network tab for CORS errors
- Verify frontend API service configuration

**Features not working:**
- Check browser console for JavaScript errors
- Verify backend logs for error messages
- Test individual API endpoints with curl/Postman

## ✅ Success Criteria

The system is fully functional when:
- ✅ Backend starts without errors and serves all endpoints
- ✅ Frontend builds and runs without compilation issues
- ✅ Users can browse inventory, add items to cart, and checkout
- ✅ Smart features (replacements, suggestions) work correctly
- ✅ Loyalty points and environmental impact track properly
- ✅ All error cases are handled gracefully
- ✅ The user experience is smooth and intuitive
