import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import CartItem from '../components/CartItem';
import { useToast } from '../components/Toast';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  AlertCircle,
  Package,
  CreditCard,
  Sparkles
} from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { user } = useUser();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  // Safe helper functions
  const formatPrice = (price) => {
    if (!price || typeof price !== 'number') return '$0.00';
    return apiService.formatPrice ? apiService.formatPrice(price) : `$${price.toFixed(2)}`;
  };
  
  const [loading, setLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    totalOriginalPrice: 0,
    totalDiscountedPrice: 0,
    totalDiscount: 0,
    loyaltyPointsEarned: 0
  });

  useEffect(() => {
    calculateCartSummary();
  }, [cart]);

  const calculateCartSummary = () => {
    const summary = cart.reduce((acc, item) => {
      const originalTotal = item.price_per_unit * item.quantity;
      const discountedTotal = (item.discounted_price || item.price_per_unit) * item.quantity;
      const discount = originalTotal - discountedTotal;
      
      return {
        totalItems: acc.totalItems + item.quantity,
        totalOriginalPrice: acc.totalOriginalPrice + originalTotal,
        totalDiscountedPrice: acc.totalDiscountedPrice + discountedTotal,
        totalDiscount: acc.totalDiscount + discount,
        loyaltyPointsEarned: acc.loyaltyPointsEarned + (item.loyalty_points || 0)
      };
    }, {
      totalItems: 0,
      totalOriginalPrice: 0,
      totalDiscountedPrice: 0,
      totalDiscount: 0,
      loyaltyPointsEarned: 0
    });
    
    setCartSummary(summary);
  };

  const handleRemoveItem = async (itemId, quantity = null) => {
    if (!user?.id) {
      showError('User not logged in');
      return;
    }
    
    setLoading(true);
    const result = await removeFromCart(user.id, itemId, quantity);
    
    if (result.success) {
      showSuccess('Item removed from cart');
    } else {
      showError(result.message || 'Failed to remove item');
    }
    setLoading(false);
  };

  const handleClearCart = async () => {
    if (!user?.id) {
      showError('User not logged in');
      return;
    }
    
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setLoading(true);
      const result = await clearCart(user.id);
      
      if (result.success) {
        showSuccess('Cart cleared successfully');
      } else {
        showError(result.message || 'Failed to clear cart');
      }
      setLoading(false);
    }
  };

  const getExpiryWarning = (expiryDate) => {
    if (!apiService.getDaysUntilExpiry) {
      return { show: false };
    }
    
    const days = apiService.getDaysUntilExpiry(expiryDate);
    if (days <= 2) {
      return {
        show: true,
        message: days === 0 ? 'Expires today!' : days === 1 ? 'Expires tomorrow!' : `Expires in ${days} days`,
        severity: days <= 1 ? 'critical' : 'warning'
      };
    }
    return { show: false };
  };

  if (cartLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="spinner spinner-primary mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-8">
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingCart size={64} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Start shopping for fresh products and help reduce food waste!</p>
          <Link to="/inventory" className="btn btn-primary">
            <Package className="mr-2" size={20} />
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">
              <ShoppingCart className="mr-3" size={32} />
              Your Cart
            </h1>
            <p className="page-description">
              {cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? 's' : ''} ready for checkout
            </p>
          </div>
          <button 
            onClick={handleClearCart}
            className="btn btn-outline-danger"
            disabled={loading}
          >
            <Trash2 className="mr-2" size={18} />
            Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="card">
            <div className="card-header">
              <h3>Items in Cart</h3>
            </div>
            <div className="card-body p-0">
              {cart.map((item, index) => {
                const warning = getExpiryWarning(item.expiry_date);
                
                return (
                  <div key={`${item.item_id}-${index}`} className="cart-item-wrapper">
                    {warning.show && (
                      <div className={`expiry-warning ${warning.severity}`}>
                        <AlertCircle size={16} />
                        <span>{warning.message}</span>
                      </div>
                    )}
                    <CartItem
                      item={item}
                      onUpdate={calculateCartSummary}
                      onRemove={() => handleRemoveItem(item.item_id)}
                      loading={loading}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="card sticky-summary">
            <div className="card-header">
              <h3>Order Summary</h3>
            </div>
            <div className="card-body">
              <div className="summary-row">
                <span>Items ({cartSummary.totalItems})</span>
                <span>{formatPrice(cartSummary.totalOriginalPrice)}</span>
              </div>
              
              {cartSummary.totalDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Savings</span>
                  <span className="text-success">
                    -{formatPrice(cartSummary.totalDiscount)}
                  </span>
                </div>
              )}
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(cartSummary.totalDiscountedPrice)}</span>
              </div>
              
              {cartSummary.loyaltyPointsEarned > 0 && (
                <div className="loyalty-points">
                  <Sparkles className="mr-2" size={18} />
                  <span>You'll earn {cartSummary.loyaltyPointsEarned} loyalty points!</span>
                </div>
              )}
              
              <Link 
                to="/checkout"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
              >
                <CreditCard className="mr-2" size={20} />
                Proceed to Checkout
                <ArrowRight className="ml-2" size={20} />
              </Link>
              
              <Link 
                to="/inventory"
                className="btn btn-outline-primary w-100 mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
