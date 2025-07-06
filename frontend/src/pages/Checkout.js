import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { apiService } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  CreditCard, 
  Check, 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Calendar,
  Sparkles,
  Leaf,
  Award,
  DollarSign
} from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, updateUserImpact } = useUser();
  const { showSuccess, showError, ToastContainer } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    totalItems: 0,
    totalOriginalPrice: 0,
    totalDiscountedPrice: 0,
    totalDiscount: 0,
    loyaltyPointsEarned: 0,
    foodSaved: 0
  });

  useEffect(() => {
    if (cart.length === 0 && !checkoutComplete) {
      navigate('/cart');
      return;
    }
    calculateOrderSummary();
  }, [cart, navigate, checkoutComplete]);

  const calculateOrderSummary = () => {
    const summary = cart.reduce((acc, item) => {
      const originalTotal = item.price_per_unit * item.quantity;
      const discountedTotal = (item.discounted_price || item.price_per_unit) * item.quantity;
      const discount = originalTotal - discountedTotal;
      const estimatedWeight = item.estimated_weight || 0.5; // Default 0.5kg if not specified
      
      return {
        totalItems: acc.totalItems + item.quantity,
        totalOriginalPrice: acc.totalOriginalPrice + originalTotal,
        totalDiscountedPrice: acc.totalDiscountedPrice + discountedTotal,
        totalDiscount: acc.totalDiscount + discount,
        loyaltyPointsEarned: acc.loyaltyPointsEarned + item.quantity, // 1 point per item
        foodSaved: acc.foodSaved + (estimatedWeight * item.quantity)
      };
    }, {
      totalItems: 0,
      totalOriginalPrice: 0,
      totalDiscountedPrice: 0,
      totalDiscount: 0,
      loyaltyPointsEarned: 0,
      foodSaved: 0
    });
    
    setOrderSummary(summary);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      console.log('Starting checkout for user:', user?.id || 'user1');
      console.log('Cart items:', cart);
      
      const response = await apiService.checkout(user?.id || 'user1', true);
      console.log('Checkout response:', response);
      
      if (response.success) {
        setCheckoutResult({
          ...response,
          // Use backend calculated values or fallback to frontend calculations
          food_saved_kg: response.environmental_impact?.food_saved_kg || orderSummary.foodSaved,
          total_savings: response.total_value || orderSummary.totalDiscountedPrice,
          loyalty_points_earned: response.points_earned || orderSummary.loyaltyPointsEarned
        });
        setCheckoutComplete(true);
        
        // Update user impact with backend values
        if (updateUserImpact) {
          updateUserImpact({
            foodSaved: response.environmental_impact?.food_saved_kg || orderSummary.foodSaved,
            moneySaved: response.total_value || orderSummary.totalDiscount,
            co2Saved: response.environmental_impact?.co2_saved_kg || 0,
            itemsRescued: response.environmental_impact?.items_rescued || orderSummary.totalItems
          });
        }
        
        // Update impact dashboard on backend
        try {
          await apiService.updateImpactDashboard(user?.id || 'user1', {
            total_food_saved: response.environmental_impact?.food_saved_kg || orderSummary.foodSaved,
            total_money_saved: response.total_value || orderSummary.totalDiscount,
            total_co2_reduced: response.environmental_impact?.co2_saved_kg || 0,
            total_items: response.environmental_impact?.items_rescued || orderSummary.totalItems,
            total_orders: 1,
            total_loyalty_points: response.points_earned || orderSummary.loyaltyPointsEarned
          }, 'add');
        } catch (dashError) {
          console.warn('Failed to update impact dashboard:', dashError);
        }
        
        showSuccess(`Order placed successfully! ${response.points_earned || orderSummary.loyaltyPointsEarned} loyalty points earned!`);
        
        // Clear cart after successful checkout
        setTimeout(() => {
          clearCart(user?.id || 'user1');
        }, 2000);
        
      } else {
        throw new Error(response.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showError(error.message || 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutComplete && checkoutResult) {
    return (
      <div className="container py-8">
        <ToastContainer />
        <div className="checkout-success">
          <div className="success-icon">
            <Check size={64} />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for helping reduce food waste with FreshGuard!
          </p>
          
          <div className="success-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Leaf />
              </div>
              <div className="stat-content">
                <h3>{checkoutResult.food_saved_kg?.toFixed(1) || orderSummary.foodSaved.toFixed(1)} kg</h3>
                <p>Food Saved</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <DollarSign />
              </div>
              <div className="stat-content">
                <h3>{apiService.formatPrice(checkoutResult.total_savings || orderSummary.totalDiscount)}</h3>
                <p>Money Saved</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Award />
              </div>
              <div className="stat-content">
                <h3>{checkoutResult.loyalty_points_earned || orderSummary.loyaltyPointsEarned}</h3>
                <p>Points Earned</p>
              </div>
            </div>
          </div>
          
          <div className="success-actions">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              View Impact Dashboard
            </button>
            <button 
              onClick={() => navigate('/inventory')}
              className="btn btn-outline-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ToastContainer />
      
      {/* Header */}
      <div className="checkout-header">
        <button 
          onClick={() => navigate('/cart')}
          className="btn btn-ghost"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Cart
        </button>
        <h1 className="page-title">
          <CreditCard className="mr-3" size={32} />
          Checkout
        </h1>
      </div>

      <div className="checkout-layout">
        {/* Order Items */}
        <div className="checkout-items">
          <div className="card">
            <div className="card-header">
              <h3>Order Review</h3>
            </div>
            <div className="card-body">
              {cart.map((item, index) => (
                <div key={`${item.item_id}-${index}`} className="checkout-item">
                  <div className="item-info">
                    <h4>{item.name || item.item_name}</h4>
                    <p className="item-category">{item.category}</p>
                    <div className="item-expiry">
                      <Calendar size={14} />
                      <span>Expires: {apiService.formatDate(item.expiry_date)}</span>
                    </div>
                  </div>
                  <div className="item-pricing">
                    <div className="quantity">Qty: {item.quantity}</div>
                    {item.discounted_price && item.discounted_price < item.price_per_unit ? (
                      <div className="price-display">
                        <span className="original-price">{apiService.formatPrice(item.price_per_unit)}</span>
                        <span className="discounted-price">{apiService.formatPrice(item.discounted_price)}</span>
                      </div>
                    ) : (
                      <div className="price-display">
                        <span className="current-price">{apiService.formatPrice(item.price_per_unit)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="card">
            <div className="card-header">
              <h3>Delivery Information</h3>
            </div>
            <div className="card-body">
              <div className="delivery-option selected">
                <div className="delivery-icon">
                  <Truck />
                </div>
                <div className="delivery-details">
                  <h4>Standard Pickup</h4>
                  <p>Available today after 2 PM</p>
                  <div className="delivery-address">
                    <MapPin size={14} />
                    <span>Walmart Supercenter - Main St</span>
                  </div>
                </div>
                <div className="delivery-price">
                  <span className="price">FREE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="card sticky-summary">
            <div className="card-header">
              <h3>Order Summary</h3>
            </div>
            <div className="card-body">
              <div className="summary-row">
                <span>Items ({orderSummary.totalItems})</span>
                <span>{apiService.formatPrice(orderSummary.totalOriginalPrice)}</span>
              </div>
              
              {orderSummary.totalDiscount > 0 && (
                <div className="summary-row discount">
                  <span>FreshGuard Savings</span>
                  <span className="text-success">
                    -{apiService.formatPrice(orderSummary.totalDiscount)}
                  </span>
                </div>
              )}
              
              <div className="summary-row">
                <span>Pickup</span>
                <span className="text-success">FREE</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{apiService.formatPrice(orderSummary.totalDiscountedPrice)}</span>
              </div>
              
              {/* Impact Summary */}
              <div className="impact-summary">
                <h4>Your Impact</h4>
                <div className="impact-item">
                  <Leaf className="mr-2" size={16} />
                  <span>{orderSummary.foodSaved.toFixed(1)} kg food saved</span>
                </div>
                {orderSummary.loyaltyPointsEarned > 0 && (
                  <div className="impact-item">
                    <Sparkles className="mr-2" size={16} />
                    <span>{orderSummary.loyaltyPointsEarned} loyalty points earned</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleCheckout}
                className="btn btn-primary btn-lg w-100"
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={20} />
                    Place Order
                  </>
                )}
              </button>
              
              <div className="payment-info">
                <p className="text-sm text-muted">
                  This is a demo. No actual payment will be processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
