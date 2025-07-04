# FreshGuard 2.0: Workflow Diagram

## Overview
The workflow diagram (`workflow.xml`) visualizes the end-to-end process of FreshGuard 2.0, from user session to Firebase integration, including AI model training. It uses color-coded modules for clarity and includes examples (e.g., adding cheese on July 4, 2025, with near-expiry offer for cheese expiring July 9). Import into [diagrams.net](https://app.diagrams.net) via "File > Import".

## Modules
1. **Model Training (Purple)**: Train `DecisionTreeRegressor` on `food_data.csv`, save to `shelf_life_model.joblib`.
2. **User Session & Item Addition (Green)**: User searches inventory, adds item (e.g., Cheese), predicts shelf life (7 days), updates cart.
3. **Near-Expiry Replacement (Yellow)**: Scan inventory for items expiring ≤5 days, offer discounts/points (e.g., 20% off, 10 points for cheese).
4. **Cart Removal (Orange)**: Remove items from cart.
5. **Checkout & Metrics (Orange)**: Confirm cart, update inventory, calculate food saved (e.g., 4 kg).
6. **User Alerts (Purple)**: Check for items expiring ≤2 days, send alerts (e.g., “Cheese expires July 11” on July 9).
7. **Frontend Integration (Red)**: Display cart, suggestions, alerts, and metrics in React UI.
8. **Database Transition (Red)**: Migrate to Firebase for cart, inventory, metrics.

## XML Content
```xml
<mxfile host="app.diagrams.net" modified="2025-07-04T20:34:00.000Z" agent="Grok 3" version="1.0" etag="freshguard_workflow_v5" type="diagram">
  <diagram id="freshguard_workflow" name="FreshGuard 2.0 Workflow">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="2500" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Module 0: Model Training -->
        <mxCell id="train_model" value="Train Shelf Life Model<br>(DecisionTreeRegressor on food_data.csv)" style="rounded=0;whiteSpace=wrap;html=1;fontSize=12;fillColor=#E6E6FA;strokeColor=#4B0082;" vertex="1" parent="1">
          <mxGeometry x="380" y="30" width="140" height="80" as="geometry"/>
        </mxCell>
        <!-- Module 1: User Session and Item Addition -->
        <mxCell id="start" value="User Starts Session<br>(e.g., user_id: 123)" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fontSize=12;fillColor=#DAE8FC;strokeColor=#6C8EBF;" vertex="1" parent="1">
          <mxGeometry x="400" y="150" width="100" height="60" as="geometry"/>
        </mxCell>
        <!-- Additional nodes and edges as per previous response -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Usage
- Save as `docs/workflow.xml`.
- Import into [diagrams.net](https://app.diagrams.net).
- Export as `workflow.png` for pitch slides.
- Reference in team discussions to align on workflow steps.