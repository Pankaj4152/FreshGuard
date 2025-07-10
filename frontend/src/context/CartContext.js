import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useUser } from './UserContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, refreshUserData, updateUserImpact } = useUser();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define loadCart function first
  const loadCart = useCallback(async () => {
    if (!user?.id) return; // Early return if no user
    
    try {
      setLoading(true);
      const userId = user.id;
      const response = await apiService.getCart(userId);
      if (response.success) {
        // Backend returns cart items in 'cart' or 'items' field
        const cartItems = response.cart || response.items || [];
        setCart(cartItems);
      } else {
        console.error('Failed to load cart:', response.error);
        setError(response.error);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load cart on mount and when user changes
  useEffect(() => {
    if (user && user.id) {
      loadCart();
    }
  }, [user, loadCart]);

  const addToCart = async (userId, itemQuery, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use smart cart features for better UX
      const response = await apiService.addToCartWithSuggestions(userId, itemQuery, quantity);
      
      if (response.success) {
        // Reload cart to get updated data
        await loadCart();
        return response;
      } else {
        setError(response.message || 'Failed to add item to cart');
        return response;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const addReplacementToCart = async (userId, originalItemId, replacement, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.addReplacementToCart(userId, originalItemId, replacement, quantity);
      
      if (response.success) {
        await loadCart();
        return response;
      } else {
        setError(response.message || 'Failed to add replacement to cart');
        return response;
      }
    } catch (error) {
      console.error('Error adding replacement to cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (userId, itemId, quantity = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.removeFromCart(userId, itemId, quantity);
      
      if (response.success) {
        await loadCart();
        return response;
      } else {
        setError(response.message || 'Failed to remove item from cart');
        return response;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (userId, itemId, newQuantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.updateCartQuantity(userId, itemId, newQuantity);
      
      if (response.success) {
        await loadCart();
        return response;
      } else {
        setError(response.message || 'Failed to update quantity');
        return response;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
      await loadCart(); // Reload cart to ensure consistency
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.clearCart(userId);
      
      if (response.success) {
        setCart([]);
        return response;
      } else {
        setError(response.message || 'Failed to clear cart');
        return response;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.checkout(userId);
      
      if (response.success) {
        setCart([]);
        
        // Update user impact based on checkout data
        if (response.environmental_impact) {
          updateUserImpact({
            foodSaved: response.environmental_impact.food_saved_kg,
            moneySaved: response.total_value || 0,
            co2Saved: response.environmental_impact.co2_saved_kg,
            itemsRescued: response.environmental_impact.items_rescued
          });
        }
        
        // Refresh user data to get updated loyalty points and impact
        await refreshUserData();
        
        return response;
      } else {
        setError(response.message || 'Checkout failed');
        return response;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const discountedPrice = item.discounted_price || item.price_per_unit;
      return total + (item.quantity * discountedPrice);
    }, 0);
  };

  const getCartOriginalTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.quantity * item.price_per_unit);
    }, 0);
  };

  const getCartDiscount = () => {
    return getCartOriginalTotal() - getCartTotal();
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSummary = useCallback(() => {
    if (!Array.isArray(cart) || cart.length === 0) {
        return {
            totalItems: 0,
            totalOriginalPrice: 0,
            totalDiscountedPrice: 0,
            totalDiscount: 0,
            loyaltyPointsEarned: 0,
            estimatedTax: 0,
            finalTotal: 0
        };
    }
    const summary = cart.reduce((acc, item) => {
        const quantity = item.quantity || 0;
        const originalPrice = item.price_per_unit || 0;
        const discountedPrice = (typeof item.discounted_price === 'number') ? item.discounted_price : originalPrice;
        acc.totalItems += quantity;
        acc.totalOriginalPrice += quantity * originalPrice;
        acc.totalDiscountedPrice += quantity * discountedPrice;
        return acc;
    }, {
        totalItems: 0,
        totalOriginalPrice: 0,
        totalDiscountedPrice: 0
    });
    summary.totalDiscount = summary.totalOriginalPrice - summary.totalDiscountedPrice;
    summary.loyaltyPointsEarned = Math.floor(summary.totalDiscountedPrice / 10); // Example: 1 point per $10
    summary.estimatedTax = summary.totalDiscountedPrice * 0.08; // 8% tax
    summary.finalTotal = summary.totalDiscountedPrice + summary.estimatedTax;
    return summary;
}, [cart]);
  
  const calculateCartSummary = () => {
    return getCartSummary();
  };
  
  const getShippingOptions = () => {
    const cartTotal = getCartTotal();
    
    return [
      {
        id: 'pickup',
        name: 'Store Pickup',
        description: 'Free same-day pickup at store',
        price: 0,
        isDefault: true,
        estimatedDelivery: 'Today after 2 PM',
        eco: true
      },
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Delivery within 2-3 days',
        price: cartTotal >= 35 ? 0 : 4.99,
        isDefault: false,
        estimatedDelivery: 'Wed, Jul 10',
        eco: false
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Next-day delivery',
        price: 9.99,
        isDefault: false,
        estimatedDelivery: 'Tomorrow, Jul 8',
        eco: false
      }
    ];
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    addReplacementToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    loadCart,
    getCartTotal,
    getCartOriginalTotal,
    getCartDiscount,
    getCartItemCount,
    getCartSummary,
    calculateCartSummary,
    getShippingOptions
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
