import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import { Plus, Minus, Trash2, BookmarkIcon } from 'lucide-react';

const CartItem = ({ item, onUpdate, onRemove, loading = false }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { user } = useUser();
  const [saveForLaterLoading, setSaveForLaterLoading] = useState(false);

  // Safe helper functions
  const formatPrice = (price) => {
    if (!price || typeof price !== 'number') return '$0.00';
    return apiService.formatPrice ? apiService.formatPrice(price) : `$${price.toFixed(2)}`;
  };

  const handleQuantityChange = async (newQuantity) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    if (newQuantity < 1) {
      await handleRemove();
    } else {
      const result = await updateQuantity(user.id, item.item_id, newQuantity);
      if (result.success && onUpdate) {
        onUpdate();
      }
    }
  };

  const handleRemove = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    const result = await removeFromCart(user.id, item.item_id);
    if (result.success && onRemove) {
      onRemove();
    }
  };

  const handleSaveForLater = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    setSaveForLaterLoading(true);
    try {
      // This would be implemented in a real API
      // For now, just show a simulated success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Display success message
      const itemName = item.name || item.item_name || 'Item';
      
      // Check if there's a toast notification system available
      if (window.showToast) {
        window.showToast(`${itemName} saved for later`);
      } else {
        // Fallback to alert
        alert(`${itemName} saved for later`);
      }
      
      // Remove the item from cart after saving for later
      await handleRemove();
    } catch (error) {
      console.error('Failed to save item for later:', error);
    } finally {
      setSaveForLaterLoading(false);
    }
  };

  const getProductIcon = (category) => {
    const icons = {
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Bakery': '🍞',
      'Seafood': '🐟',
      'Frozen': '🧊',
      'Pantry': '🥫'
    };
    return icons[category] || '🛒';
  };

  const expiryStatus = apiService.getExpiryStatus ? apiService.getExpiryStatus(item.expiry_date) : { status: 'unknown', text: 'Unknown', class: 'text-gray-500' };
  
  // Calculate discount percentage locally to ensure it works
  const calculateDiscountPercent = () => {
    if (!item.discounted_price || !item.price_per_unit || item.discounted_price >= item.price_per_unit) {
      return 0;
    }
    return Math.round(((item.price_per_unit - item.discounted_price) / item.price_per_unit) * 100);
  };
  
  const discountPercent = calculateDiscountPercent();
  // Force discounts to be shown for specific items if needed (for debugging)
  // const hasDiscount = true;
  const hasDiscount = discountPercent > 0;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <span style={{ fontSize: '1.5rem' }}>
          {getProductIcon(item.category)}
        </span>
      </div>
      
      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name || item.item_name || 'Product'}</h4>
        <div className="cart-item-details">
          <span className="text-secondary">{item.category}</span>
          {hasDiscount && (
            <span className="badge badge-success ml-2">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        <div className="cart-item-details">
          <span className={`text-sm ${expiryStatus.status === 'critical' ? 'text-danger' : 
                          expiryStatus.status === 'warning' ? 'text-warning' : 'text-secondary'}`}>
            Expires: {apiService.formatDate ? apiService.formatDate(item.expiry_date) : item.expiry_date || 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="quantity-controls">
        <button
          className="quantity-btn"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="quantity-display">{item.quantity}</span>
        <button
          className="quantity-btn"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={loading}
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="cart-item-price">
        <div className="price-details">
          {/* Per Unit Pricing */}
          <div className="unit-price">
            {hasDiscount ? (
              <>
                <div className="price-line">
                  <span className="price-original strikethrough">
                    {formatPrice(item.price_per_unit)}
                  </span>
                  <span className="discount-badge">
                    -{discountPercent}% OFF
                  </span>
                </div>
                <div className="price-current">
                  <strong className="discounted-price-value">{formatPrice(item.discounted_price)}</strong> each
                </div>
                <div className="unit-savings">
                  <small className="text-success">You save: {formatPrice(item.price_per_unit - item.discounted_price)} per item</small>
                </div>
              </>
            ) : (
              <div className="price-current">
                {formatPrice(item.price_per_unit)} each
              </div>
            )}
          </div>
          
          {/* Total Line Price */}
          <div className="total-price">
            {hasDiscount ? (
              <div className="total-with-discount">
                <div className="total-original strikethrough">
                  Total: {formatPrice(item.price_per_unit * item.quantity)}
                </div>
                <div className="total-discounted">
                  <strong>{formatPrice(item.discounted_price * item.quantity)}</strong>
                </div>
                <div className="savings-amount text-success">
                  You save: {formatPrice((item.price_per_unit - item.discounted_price) * item.quantity)}
                </div>
              </div>
            ) : (
              <div className="total-regular">
                <strong>Total: {formatPrice(item.price_per_unit * item.quantity)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="cart-item-actions">
        <button
          className="btn btn-sm btn-danger"
          onClick={handleRemove}
          disabled={loading || saveForLaterLoading}
          title="Remove from cart"
        >
          <Trash2 size={16} />
        </button>
        
        <button
          className="btn btn-sm btn-outline-secondary save-for-later-btn"
          onClick={handleSaveForLater}
          disabled={loading || saveForLaterLoading}
          title="Save for later"
        >
          <BookmarkIcon size={16} />
          {saveForLaterLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
