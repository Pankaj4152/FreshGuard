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
  Sparkles,
  Award,
  Truck,
  Clock,
  MapPin
} from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, loading: cartLoading, getCartSummary, getShippingOptions } = useCart();
  const { user } = useUser();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  // Expose toast functions globally for components that don't have direct access
  React.useEffect(() => {
    window.showToast = showSuccess;
    window.showError = showError;
    
    return () => {
      // Clean up on unmount
      delete window.showToast;
      delete window.showError;
    };
  }, [showSuccess, showError]);
  
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
    loyaltyPointsEarned: 0,
    estimatedTax: 0,
    finalTotal: 0
  });
  const [selectedShipping, setSelectedShipping] = useState('pickup');
  const [shippingOptions, setShippingOptions] = useState([]);

  useEffect(() => {
    // Use the enhanced getCartSummary from CartContext
    const summary = getCartSummary();
    setCartSummary(summary);
    
    // Get shipping options
    const options = getShippingOptions();
    setShippingOptions(options);
    
    // Set default option
    const defaultOption = options.find(opt => opt.isDefault);
    if (defaultOption) {
      setSelectedShipping(defaultOption.id);
    }
  }, [cart, getCartSummary, getShippingOptions]);
  
  // Function to recalculate cart summary - called after cart item updates
  const calculateCartSummary = () => {
    const summary = getCartSummary();
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
              {/* Detailed Item Breakdown */}
              <div className="summary-section">
                <h5 className="summary-section-title">
                  <Package size={16} className="me-2" />
                  Items in Your Cart ({cartSummary.totalItems})
                </h5>
                {cart.map((item, index) => {
                  const hasItemDiscount = item.discounted_price && item.discounted_price < item.price_per_unit;
                  const itemDiscount = hasItemDiscount ? (item.price_per_unit - item.discounted_price) * item.quantity : 0;
                  const discountPercent = hasItemDiscount ? Math.round(((item.price_per_unit - item.discounted_price) / item.price_per_unit) * 100) : 0;
                  
                  return (
                    <div key={`summary-${item.item_id}-${index}`} className="summary-item detailed">
                      <div className="summary-item-info">
                        <div className="item-header">
                          <span className="item-name">{item.name || item.item_name}</span>
                          <span className="item-quantity">×{item.quantity}</span>
                        </div>
                        <div className="item-details">
                          <span className="item-category text-muted">{item.category}</span>
                          {hasItemDiscount && (
                            <span className="item-discount-badge">
                              -{discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="summary-item-price">
                        {hasItemDiscount ? (
                          <div className="price-breakdown">
                            <div className="original-price strikethrough">
                              {formatPrice(item.price_per_unit * item.quantity)}
                            </div>
                            <div className="discounted-price">
                              <strong>{formatPrice(item.discounted_price * item.quantity)}</strong>
                            </div>
                            <div className="savings text-success">
                              Save {formatPrice(itemDiscount)}
                            </div>
                          </div>
                        ) : (
                          <div className="regular-price">
                            <strong>{formatPrice(item.price_per_unit * item.quantity)}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="summary-divider"></div>
              
              {/* Detailed Cost Breakdown */}
              <div className="summary-section">
                <h5 className="summary-section-title">
                  <span>💰</span>
                  Order Summary
                </h5>
                
                <div className="summary-row">
                  <span>Subtotal ({cartSummary.totalItems} items)</span>
                  <span>{formatPrice(cartSummary.totalOriginalPrice)}</span>
                </div>
                
                {cartSummary.totalDiscount > 0 && (
                  <>
                    <div className="summary-row discount-detail">
                      <span className="discount-breakdown">
                        <span>🏷️ FreshGuard Discounts</span>
                        <small className="text-muted d-block">Smart pricing for near-expiry items</small>
                      </span>
                      <span className="text-success">
                        -{formatPrice(cartSummary.totalDiscount)}
                      </span>
                    </div>
                    <div className="summary-row subtotal-after-discount">
                      <span>Subtotal after discounts</span>
                      <span>{formatPrice(cartSummary.totalDiscountedPrice)}</span>
                    </div>
                  </>
                )}
                
                <div className="summary-row">
                  <span className="tax-breakdown">
                    <span>🧾 Estimated Tax (8%)</span>
                    <small className="text-muted d-block">Applied at checkout</small>
                  </span>
                  <span>{formatPrice(cartSummary.totalDiscountedPrice * 0.08)}</span>
                </div>
                
                <div className="summary-row shipping">
                  <span className="shipping-breakdown">
                    <span>🚚 {shippingOptions.find(opt => opt.id === selectedShipping)?.name || 'Shipping'}</span>
                    <small className="text-muted d-block">
                      {shippingOptions.find(opt => opt.id === selectedShipping)?.description || 'Standard shipping'}
                    </small>
                  </span>
                  {shippingOptions.find(opt => opt.id === selectedShipping)?.price === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    <span>{formatPrice(shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0)}</span>
                  )}
                </div>
                
                <div className="summary-divider thick"></div>
                
                <div className="summary-row total">
                  <div className="total-breakdown">
                    <span className="total-label">Order Total</span>
                    {cartSummary.totalDiscount > 0 && (
                      <small className="total-savings text-success">
                        You're saving {formatPrice(cartSummary.totalDiscount)} today!
                      </small>
                    )}
                  </div>
                  <span className="total-amount">
                    {formatPrice(
                      cartSummary.totalDiscountedPrice + 
                      (cartSummary.totalDiscountedPrice * 0.08) + 
                      (shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0)
                    )}
                  </span>
                </div>
              </div>
              
              <div className="summary-divider"></div>
              
              {/* Shipping Options Section */}
              <div className="summary-section">
                <h5 className="summary-section-title">
                  <Truck size={16} className="me-2" />
                  Shipping Options
                </h5>
                
                <div className="shipping-options">
                  {shippingOptions.map(option => (
                    <div 
                      key={option.id} 
                      className={`shipping-option ${selectedShipping === option.id ? 'selected' : ''}`}
                      onClick={() => setSelectedShipping(option.id)}
                    >
                      <div className="shipping-option-radio">
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={selectedShipping === option.id} 
                          onChange={() => setSelectedShipping(option.id)}
                        />
                      </div>
                      <div className="shipping-option-details">
                        <div className="shipping-option-header">
                          <span className="shipping-name">{option.name}</span>
                          <span className="shipping-price">
                            {option.price === 0 ? 'FREE' : formatPrice(option.price)}
                          </span>
                        </div>
                        <div className="shipping-option-info">
                          <span className="shipping-description">{option.description}</span>
                          <div className="shipping-meta">
                            <span className="shipping-eta">
                              <Clock size={12} className="me-1" /> {option.estimatedDelivery}
                            </span>
                            {option.eco && (
                              <span className="eco-badge">
                                <span>🌱</span> Eco-friendly
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="summary-divider"></div>
              
              {/* Enhanced Benefits Section */}
              <div className="summary-section benefits-section">
                <h5 className="summary-section-title">
                  <Sparkles size={16} className="me-2" />
                  Your Impact & Benefits
                </h5>
                
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <div className="benefit-icon-wrapper">
                      <Award className="benefit-icon text-warning" size={16} />
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Loyalty Points</span>
                      <span className="benefit-description">Earn {cartSummary.loyaltyPointsEarned} points with this order</span>
                    </div>
                  </div>
                  
                  {cartSummary.totalDiscount > 0 && (
                    <div className="benefit-item">
                      <div className="benefit-icon-wrapper">
                        <Package className="benefit-icon text-success" size={16} />
                      </div>
                      <div className="benefit-content">
                        <span className="benefit-title">Food Waste Reduction</span>
                        <span className="benefit-description">Helping save items from expiring</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="benefit-item">
                    <div className="benefit-icon-wrapper">
                      <AlertCircle className="benefit-icon text-info" size={16} />
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Convenient Pickup</span>
                      <span className="benefit-description">Ready today after 2 PM at Main St store</span>
                    </div>
                  </div>
                  
                  {cartSummary.totalDiscount > 0 && (
                    <div className="benefit-item">
                      <div className="benefit-icon-wrapper">
                        <span className="benefit-icon text-success">🌱</span>
                      </div>
                      <div className="benefit-content">
                        <span className="benefit-title">Environmental Impact</span>
                        <span className="benefit-description">Reducing CO₂ emissions through smart shopping</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
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
