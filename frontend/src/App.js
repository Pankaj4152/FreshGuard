import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import TestAPI from './pages/TestAPI';
import TestDashboard from './pages/TestDashboard';
import RedeemPoints from './pages/RedeemPoints';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import './App.css';
import './styles/cart-discounts.css';
import './styles/dashboard-enhanced.css';
import './styles/redeem-points.css';
import apiService from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Function to add a toast notification
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // Function to remove a toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // Check backend status and initialize app
    const initializeApp = async () => {
      try {
        console.log('Checking backend status...');
        const healthCheck = await apiService.healthCheck();
        console.log('Backend health check:', healthCheck);
        
        setBackendStatus({
          status: 'healthy',
          features: healthCheck.features || {},
          version: healthCheck.version || '2.0'
        });
        
        addToast('FreshGuard 2.0 is ready! 🚀', 'success', 3000);
        
        // Test basic API functionality
        try {
          const apiInfo = await apiService.getApiInfo();
          console.log('API Info:', apiInfo);
        } catch (apiError) {
          console.warn('API info not available:', apiError);
        }
        
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus({
          status: 'error',
          error: error.message,
          features: {}
        });
        addToast('Backend connection failed. Some features may not work.', 'error', 8000);
      } finally {
        // Delay to show loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="container text-center" style={{ paddingTop: '200px' }}>
          <div className="loading-spinner-wrapper">
            <div className="spinner spinner-primary" style={{ width: '60px', height: '60px', marginBottom: '20px' }}></div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <h2 className="text-primary mb-3">Loading FreshGuard 2.0...</h2>
          <p className="text-secondary">AI-driven food waste reduction for Walmart</p>
          <div className="mt-4">
            <small className="text-muted">
              {backendStatus?.status === 'error' ? '⚠️ Connecting to backend...' : '✅ Initializing smart features...'}
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <CartProvider addToast={addToast}>
        <Router>
          <div className="App">
            <Header backendStatus={backendStatus} addToast={addToast} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/inventory" element={<Inventory backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/cart" element={<Cart backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/checkout" element={<Checkout backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/dashboard" element={<Dashboard backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/alerts" element={<Alerts backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/test-api" element={<TestAPI backendStatus={backendStatus} addToast={addToast} />} />
                <Route path="/test-dashboard" element={<TestDashboard />} />
                <Route path="/redeem-points" element={<RedeemPoints />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer backendStatus={backendStatus} />
            
            {/* Toast notifications */}
            <div className="toast-container">
              {toasts.map(toast => (
                <Toast
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => removeToast(toast.id)}
                />
              ))}
            </div>
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
