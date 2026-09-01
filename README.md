# FreshGuard

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Scikit--Learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

> **AI-Driven Smart Inventory & Shelf-Life Prediction Platform**

FreshGuard is an intelligent inventory management platform that combines Machine Learning predictive algorithms with real-time stock tracking. It helps retail stores and grocery chains reduce food waste by accurately forecasting product expiry dates, optimizing discount strategies, and automating inventory rotation.

---

## 🎯 Key Features

- 🧠 **AI Shelf-Life Prediction**: Trained `scikit-learn` regression model predicting expiry windows based on storage conditions and food item types.
- 📦 **Real-Time Inventory Management**: Automated stock updates, category filtering, and real-time inventory synchronization.
- 💰 **Dynamic Discount Engine**: Automated discount recommendations for near-expiry items to maximize recovery and reduce waste.
- 🛒 **Multi-User Cart & Checkout Workflow**: Persistent user cart management connected to live stock APIs.
- 📊 **Interactive Analytics Dashboard**: React dashboard powered by `chart.js` for visual stock analytics, turnover rates, and freshness alerts.

---

## 🏗️ Architecture & Directory Overview

```
FreshGuard/
├── backend/
│   ├── api/
│   │   └── app.py                        # Flask API endpoints (inventory, cart, ML predictions)
│   ├── mock_api/
│   │   ├── current_walmart_inventory.json # Live inventory database store
│   │   └── users_cart.json                # User cart data store
│   ├── models/
│   │   ├── shelf_life_model.joblib        # Pre-trained Scikit-Learn model
│   │   ├── shelf_life_model_encoders.joblib # Feature encoders
│   │   ├── data/food_data.csv             # Model training dataset
│   │   └── predict_expiry.py              # ML prediction logic
│   └── scripts/                           # Inventory generation & CLI utilities
│
├── frontend/
│   ├── src/                               # React components, context, and dashboard UI
│   ├── public/                            # Static assets
│   └── package.json                       # Frontend dependencies & React 19 configuration
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, TailwindCSS v4, Lucide Icons, Chart.js |
| **Backend API** | Python 3.10+, Flask, Flasgger (Swagger API Docs) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Data Storage** | JSON File Stores / Firebase Integration Ready |

---

## 🚀 Quick Start

### Option 1: One-Click Startup (Windows)

- **Backend**: Double-click `start_backend.bat`
- **Frontend**: Double-click `start_frontend.bat`
- **Access App**: Open `http://localhost:3000`

---

### Option 2: Manual Terminal Setup

#### 1️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Launch Flask API server
cd api
python app.py
```
The API server will run at `http://localhost:5000`.

#### 2️⃣ Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
The application will open at `http://localhost:3000`.

---

## 🧪 Integration Testing

To run complete API & workflow integration verification:
```bash
python test_integration.py
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit Pull Requests to enhance ML models or dashboard features.

---

## 📄 License

This project is licensed under the MIT License.


---

## 🔧 Troubleshooting

- **Backend issues**: Verify Python dependencies with `pip install -r requirements.txt` and port `5000` availability.
- **Frontend build issues**: Ensure Node.js 18+ and execute `npm install` inside the `frontend/` folder.
- **Diagnostics**: Run `python test_integration.py` for comprehensive integration diagnostics.