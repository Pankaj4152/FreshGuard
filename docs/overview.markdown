# FreshGuard 2.0: Project Overview

## Purpose
FreshGuard 2.0 is an innovative solution for the Walmart hackathon (July 4-14, 2025) under the "Retail with Purpose: Building a Sustainable and Responsible Future" theme. It reduces food waste by incentivizing purchases of near-expiry items through AI-driven shelf life prediction, dynamic discounts (10-30%), and loyalty points (e.g., 10 points per item). The system uses a mock Walmart inventory, a user cart, and a React frontend with Firebase integration, delivering measurable impact (e.g., 4 kg food saved) for the hackathon demo.

## Key Features
1. **Mock Walmart Inventory**: JSON dataset (`current_walmart_inventory.json`, 75 items) with fields like `item_id`, `item_name`, `expiry_date`, `current_stock`, `price_per_unit`, `discount`.
2. **User Cart**: JSON (`users_cart.json`, later Firebase `users/{user_id}/cart`) for storing user selections.
3. **Shelf Life Prediction**: `DecisionTreeRegressor` model predicts `shelf_life_days` (e.g., 7 days for cheese) using `item_name`, `category`, `storage_type`, `current_temp_c`.
4. **Near-Expiry Replacement**: Suggests items expiring ≤5 days (e.g., cheese expiring July 9, 2025, 20% off).
5. **Cart Management**: Endpoints for adding/removing items (`/add_to_cart`, `/remove_from_cart`, `/cart`).
6. **Checkout & Metrics**: Updates inventory, calculates food saved (e.g., 0.2 kg per cheese packet).
7. **Expiry Alerts**: Notifies users of items expiring ≤2 days (e.g., “Cheese expires July 11” on July 9).
8. **React Frontend**: Displays cart, suggestions (`Inventory.js`), alerts (`Alerts.js`), and metrics (`Dashboard.js` with Chart.js).
9. **Firebase Integration**: Stores cart, inventory, and metrics (post-July 6, 2025).
10. **Metrics Visualization**: Dashboard shows food saved and points via bar charts.

## Hackathon Alignment
- **Innovation**: Combines AI (shelf life prediction), customer incentives (discounts, points), and modern tech (React, Firebase).
- **Feasibility**: Uses simple `DecisionTreeRegressor`, JSON-based mock data, and achievable 10-14 day timeline.
- **Impact**: Reduces food waste (e.g., 4 kg saved in demo), aligns with Walmart’s sustainability goals (e.g., partnerships with GreenPod Labs).
- **Demo Quality**: Showcases adding cheese, near-expiry offer, checkout, alerts, and metrics in a 2-minute video.

## Team
- 4 members: Backend Dev, AI/ML Lead, Backend/Frontend Dev, UI/Testing Lead.
- Skills: Strong AI/ML, moderate web development (Flask, React, Firebase).

## Timeline
- **July 4, 2025**: Build inventory, train model, implement cart endpoints, draft demo outline.
- **July 5, 2025**: Add checkout, alerts, start React frontend.
- **July 6, 2025**: Complete frontend, integrate Firebase, prepare demo video.
- **July 7-14, 2025**: Test, refine, submit demo (unlisted YouTube video).

## Next Steps
- Set up folder structure (`freshguard-2.0/`).
- Generate datasets (`current_walmart_inventory.json`, `food_data.csv`).
- Develop and test backend (`app.py`), frontend (`Inventory.js`, `Alerts.js`, `Dashboard.js`), and model (`predict_expiry.py`).
- Import `workflow.xml` into [diagrams.net](https://app.diagrams.net) for visuals.