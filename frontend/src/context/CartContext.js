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
        // Handle replacement offers and smart suggestions
        if (response.replacement || response.hasReplacements) {
          return {
            success: false,
            message: response.message,
            replacement: response.replacement,
            replacements: response.replacements,
            hasReplacements: response.hasReplacements,
            warning: response.warning,
            incentive: response.incentive,
            original: response.original
          };
        }
        setError(response.message || 'Failed to add item to cart');
        return response;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to regular add to cart
      try {
        const fallbackResponse = await apiService.addToCart(userId, itemQuery, quantity);
        if (fallbackResponse.success) {
          await loadCart();
        }
        return fallbackResponse;
      } catch (fallbackError) {
        setError(fallbackError.message);
        return { success: false, error: fallbackError.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const addReplacementToCart = async (userId, replacement, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.addReplacementToCart(userId, replacement, quantity);
      
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
      return total + (item.quantity * item.price_per_unit);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
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
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
