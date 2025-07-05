import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
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

  // Load cart on mount and when user changes
  useEffect(() => {
    if (user && user.id) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'user1'; // Fallback for safety
      const response = await apiService.getCart(userId);
      if (response.success) {
        setCart(response.cart || []);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (userId, itemQuery, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API - FIX: Use correct parameter name
      const response = await apiService.addToCart(userId, itemQuery, quantity);
      
      if (response.success) {
        // Reload cart to get updated data
        await loadCart();
        return response;
      } else {
        // Handle replacement offers
        if (response.replacement) {
          return {
            success: false,
            message: response.message,
            replacement: response.replacement,
            original: response.original
          };
        }
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
      
      if (newQuantity <= 0) {
        return await removeFromCart(userId, itemId);
      }
      
      // First remove the item completely, then add the new quantity
      await apiService.removeFromCart(userId, itemId);
      
      // Find the item in inventory to get the item_name for re-adding
      const inventory = await apiService.getInventory();
      const item = inventory.inventory?.find(i => i.item_id === itemId);
      
      if (item) {
        const response = await apiService.addToCart(userId, item.item_name, newQuantity);
        if (response.success) {
          await loadCart();
          return response;
        }
      }
      
      // Fallback: just reload the cart
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
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
