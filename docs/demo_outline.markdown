# FreshGuard 2.0: Demo Outline

## Objective
Demonstrate FreshGuard 2.0’s ability to reduce food waste by incentivizing near-expiry purchases, using a 2-minute unlisted YouTube video for the Walmart hackathon (due July 14, 2025).

## Script (2 Minutes)
1. **Introduction (15s)**:
   - “Welcome to FreshGuard 2.0, our solution to reduce food waste for Walmart’s ‘Retail with Purpose’ theme.”
   - Show team names, highlight sustainability goal.
2. **Add Item to Cart (30s)**:
   - Open React UI, search for “Cheese” on July 4, 2025.
   - Add cheese (`/add_to_cart`), show AI-predicted shelf life (7 days, expiry: July 11).
   - Display near-expiry offer (cheese, `ITEM0001`, expiring July 9, 20% off, 10 points).
3. **Cart & Checkout (30s)**:
   - Accept offer, view cart (`/cart`).
   - Checkout (`/checkout`), show inventory update and food saved (0.2 kg per cheese packet).
4. **Alerts & Metrics (30s)**:
   - Simulate July 9, 2025, show alert (“Cheese expires in 2 days”) via `Alerts.js`.
   - Display `Dashboard.js` with Chart.js bar chart (4 kg food saved, 10 points).
5. **Conclusion (15s)**:
   - “FreshGuard 2.0 reduces waste, engages customers, and aligns with Walmart’s sustainability goals.”
   - Call to action: “Support FreshGuard 2.0 for a greener retail future!”

## Technical Setup
- **Backend**: Run `python backend/app.py` for Flask endpoints.
- **Frontend**: Run `npm start` in `frontend/` for React UI.
- **Data**: Use `current_walmart_inventory.json` (75 items), `users_cart.json`.
- **Recording**: Use screen recording tool (e.g., OBS Studio), upload to YouTube (unlisted).

## Team Roles
- **UI/Testing Lead**: Record and edit video.
- **AI/ML Lead**: Ensure model predicts correctly (cheese: 7 days).
- **Backend/Frontend Dev**: Verify UI and endpoint functionality.