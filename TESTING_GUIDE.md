# FreshGuard 2.0 - Testing Guide

## Pre-Testing Setup

### 1. Start Backend API
```bash
cd backend
python api/app.py
```
The API should run on http://localhost:5000

### 2. Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend should run on http://localhost:3000

## Testing Checklist

### ✅ Basic Navigation
- [✅] Home page loads correctly
- [ ] Navigation menu works (Home, Inventory, Alerts, Dashboard)
- [✅] Header shows FreshGuard 2.0 logo
- [✅] Footer displays correctly
- [✅] Cart icon shows in header

### ✅ Home Page
- [ ] Hero section displays
- [✅] Features section shows sustainability features
- [✅] Featured products load (near-expiry items)
- [ ] Add to cart functionality works
- [ ] Replacement modal appears for near-expiry items

### ✅ Inventory Page
- [ ] Products grid loads
- [ ] Filter by category works
- [ ] Search functionality works
- [ ] Product cards show:
  - [ ] Product name and category
  - [ ] Original and discounted prices
  - [ ] Expiry date with status
  - [ ] Stock information
  - [ ] Add to cart button
- [ ] Replacement suggestions work
- [ ] Pagination/filtering works

### ✅ Cart Page
- [ ] Cart items display correctly
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Clear cart functionality works
- [ ] Order summary shows:
  - [ ] Total items
  - [ ] Original price
  - [ ] Discounts applied
  - [ ] Final total
  - [ ] Loyalty points to be earned
- [ ] Expiry warnings display for items expiring soon
- [ ] Proceed to checkout button works

### ✅ Checkout Page
- [ ] Order review shows all cart items
- [ ] Delivery information displays
- [ ] Order summary shows correct totals
- [ ] Impact summary shows food saved
- [ ] Place order button works
- [ ] Success page displays after checkout:
  - [ ] Order confirmation
  - [ ] Impact statistics
  - [ ] Navigation to dashboard/continue shopping

### ✅ Alerts Page
- [ ] Active alerts display
- [ ] Expiring items section shows products expiring soon
- [ ] Filter tabs work (All, Critical, Warning)
- [ ] Alert settings can be configured
- [ ] Dismiss alerts functionality works
- [ ] Empty state shows when no alerts

### ✅ Dashboard Page
- [ ] Key metrics display:
  - [ ] Food saved (kg)
  - [ ] Money saved ($)
  - [ ] CO₂ reduced
  - [ ] Loyalty points
- [ ] User rank badge shows
- [ ] Monthly food saved chart displays
- [ ] Category breakdown chart works
- [ ] Impact summary shows statistics
- [ ] Environmental metrics display
- [ ] Achievements section shows earned badges

### ✅ API Integration
- [ ] Health check endpoint works (`/`)
- [ ] Inventory endpoint works (`/get_inventory`)
- [ ] Cart endpoints work:
  - [ ] Add to cart (`/add_to_cart`)
  - [ ] Get cart (`/get_cart`)
  - [ ] Remove from cart (`/remove_from_cart`)
  - [ ] Clear cart (`/clear_cart`)
- [ ] Checkout endpoint works (`/checkout`)
- [ ] Alerts endpoint works (`/get_alerts`)
- [ ] Loyalty points endpoint works (`/get_loyalty`)
- [ ] User impact endpoint works (`/user_impact`)

### ✅ Responsive Design
- [ ] Mobile navigation works
- [ ] Pages adapt to tablet size
- [ ] Pages adapt to mobile size
- [ ] Touch interactions work on mobile

### ✅ Walmart Branding
- [ ] Color scheme matches Walmart (blue, yellow, white)
- [ ] Typography is consistent
- [ ] Logo and branding are appropriate
- [ ] Overall design feels like Walmart website

## Test Scenarios

### Scenario 1: Complete Shopping Flow
1. Start on Home page
2. Browse featured products
3. Add a near-expiry item to cart
4. Accept replacement suggestion
5. Go to Inventory page
6. Add more items to cart
7. Go to Cart page
8. Review items and summary
9. Proceed to Checkout
10. Complete order
11. View impact on Dashboard

### Scenario 2: Alert Management
1. Go to Alerts page
2. Check for expiring items
3. Filter by Critical alerts
4. Add expiring item to cart from alerts
5. Dismiss non-critical alerts
6. Configure alert settings

### Scenario 3: Dashboard Review
1. Go to Dashboard
2. Review impact metrics
3. Check monthly trends
4. Review achievements
5. Check environmental impact

## Known Issues & Workarounds

### If Backend API is not running:
- Features will use mock data
- Some functionality may be limited
- Error messages will appear in console

### If Data is Missing:
- Run `python backend/scripts/generate_walmart_inventory.py`
- Check that JSON files exist in `backend/mock_api/`

## Demo Talking Points

### For Judges/Presentation:
1. **Problem**: Food waste costs $1.5 trillion globally
2. **Solution**: AI-driven inventory management with customer incentives
3. **Technology**: React frontend, Flask API, machine learning predictions
4. **Impact**: Show metrics on dashboard (food saved, money saved, CO₂ reduced)
5. **Innovation**: Dynamic pricing, loyalty points, replacement suggestions
6. **Scalability**: Modular design, API-ready, cloud deployment ready

### Key Features to Highlight:
- Real-time expiry predictions using AI
- Dynamic discount system based on expiry dates
- Gamified loyalty points system
- Environmental impact tracking
- Seamless shopping experience
- Mobile-responsive design
- Walmart-branded UI/UX

## Troubleshooting

### Common Issues:
1. **API Connection Failed**: Check if backend is running on port 5000
2. **Empty Inventory**: Run inventory generation script
3. **Cart Not Updating**: Check browser console for errors
4. **Styling Issues**: Clear browser cache and reload

### Debug URLs:
- API Health: http://localhost:5000/
- API Test Page: http://localhost:3000/test-api
- Browser DevTools: F12 → Console tab

## Success Criteria

The frontend is considered complete and working when:
- ✅ All pages load without errors
- ✅ All navigation works correctly
- ✅ Cart functionality is complete
- ✅ API integration works (with proper error handling)
- ✅ Responsive design works on all devices
- ✅ Walmart branding is consistent throughout
- ✅ Demo scenarios can be completed successfully
