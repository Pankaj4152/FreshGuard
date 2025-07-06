import React from 'react';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdate, onRemove }) => {
  const { updateQuantity, removeFromCart } = useCart();

  // Safe helper functions
  const formatPrice = (price) => {
    if (!price || typeof price !== 'number') return '$0.00';
    return apiService.formatPrice ? apiService.formatPrice(price) : `$${price.toFixed(2)}`;
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      await handleRemove();
    } else {
      const result = await updateQuantity(item.item_id, newQuantity);
      if (result.success && onUpdate) {
        onUpdate();
      }
    }
  };

  const handleRemove = async () => {
    const result = await removeFromCart(item.item_id);
    if (result.success && onRemove) {
      onRemove();
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
  const discountPercent = apiService.calculateDiscount ? apiService.calculateDiscount(item.price_per_unit, item.discounted_price) : 0;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <span style={{ fontSize: '1.5rem' }}>
          {getProductIcon(item.category)}
        </span>
      </div>
      
      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name}</h4>
        <div className="cart-item-details">
          <span className="text-secondary">{item.category}</span>
          {discountPercent > 0 && (
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
          disabled={item.quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="quantity-display">{item.quantity}</span>
        <button
          className="quantity-btn"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="cart-item-price">
        <div className="price-current">
          {formatPrice(item.discounted_price || item.price_per_unit)}
        </div>
        {discountPercent > 0 && (
          <div className="price-original text-sm">
            {formatPrice(item.price_per_unit)}
          </div>
        )}
      </div>
      
      <button
        className="btn btn-sm btn-danger"
        onClick={handleRemove}
        title="Remove from cart"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
