# FreshGuard 2.0: Hackathon Pitch

## Problem
Food waste is a global challenge, with 30-40% of food discarded annually, costing retailers like Walmart billions and harming the environment. Customers often overlook near-expiry items, contributing to waste.

## Solution: FreshGuard 2.0
FreshGuard 2.0 incentivizes purchases of near-expiry items (≤5 days) through:
- **AI-Driven Shelf Life Prediction**: `DecisionTreeRegressor` predicts expiry (e.g., 7 days for cheese).
- **Dynamic Discounts & Points**: Offers 10-30% off and 10 loyalty points (e.g., cheese expiring July 9, 20% off).
- **User-Friendly UI**: React frontend with cart, alerts, and metrics.
- **Sustainability Metrics**: Tracks food saved (e.g., 4 kg in demo).

## Technical Feasibility
- **Backend**: Flask with endpoints (`/add_to_cart`, `/checkout`, `/alerts`).
- **AI Model**: `DecisionTreeRegressor` trained on `food_data.csv` (100-200 rows).
- **Frontend**: React with Tailwind CSS, Chart.js for metrics.
- **Database**: JSON (`current_walmart_inventory.json`, 75 items), transitioning to Firebase.
- **Timeline**: Achievable in 10-14 days (July 4-14, 2025) with 4-member team.

## Impact
- **Environmental**: Reduces food waste (e.g., 4 kg saved in demo).
- **Customer Engagement**: Incentives increase loyalty and sales.
- **Walmart Alignment**: Supports sustainability initiatives (e.g., GreenPod Labs partnership).

## Demo Quality
- 2-minute video showing:
  - Adding cheese, receiving near-expiry offer (20% off, 10 points).
  - Checkout, updating inventory, calculating food saved.
  - Alerts (e.g., “Cheese expires in 2 days”).
  - Metrics dashboard (4 kg saved, Chart.js visualization).

## Team
- 4 members with AI/ML and web development expertise.
- Roles: Backend Dev, AI/ML Lead, Backend/Frontend Dev, UI/Testing Lead.

## Call to Action
Choose FreshGuard 2.0 to drive sustainability, engage customers, and showcase Walmart’s commitment to a greener future.