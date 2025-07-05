const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`, config); // Debug log
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data); // Debug log
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // For TestAPI page, we want to throw the error to be caught by the test
      throw error;
    }
  }

  // Cart operations - ENHANCED with debugging
  async addToCart(userId, itemQuery, quantity) {
    console.log('Adding to cart:', { userId, itemQuery, quantity }); // Debug
    
    const payload = {
      user_id: userId,
      item_query: itemQuery,
      quantity: quantity
    };
    
    console.log('Add to cart payload:', payload); // Debug
    
    const result = await this.request('/add_to_cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    console.log('Add to cart result:', result); // Debug
    return result;
  }

  async addReplacementToCart(userId, replacement, quantity) {
    return this.request('/add_replacement_to_cart', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        replacement: replacement,
        quantity: quantity
      }),
    });
  }

  async removeFromCart(userId, itemId, quantity = null) {
    return this.request('/remove_from_cart', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        quantity: quantity
      }),
    });
  }

  async getCart(userId) {
    const result = await this.request(`/get_cart?user_id=${userId}`);
    
    // Ensure cart is always an array - check both 'cart' and 'items' fields
    if (result.success) {
      if (!Array.isArray(result.cart)) {
        result.cart = [];
      }
      if (!Array.isArray(result.items)) {
        result.items = result.cart || [];
      }
      // Convert cart objects to array format expected by frontend
      if (Array.isArray(result.cart) && result.cart.length > 0) {
        // Backend returns array of cart items, ensure they have required fields
        result.cart = result.cart.map(item => ({
          ...item,
          // Add discounted_price if not present
          discounted_price: item.discounted_price || item.price_per_unit,
          // Ensure all required fields exist
          current_stock: item.current_stock || 999,
          category: item.category || 'General',
          expiry_date: item.expiry_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
        }));
        result.items = result.cart;
      }
    }
    
    return result;
  }

  async clearCart(userId) {
    return this.request('/clear_cart', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId
      }),
    });
  }

  async checkout(userId, clearCart = true) {
    return this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        clear_cart: clearCart
      }),
    });
  }

  // Alerts and notifications
  async getAlerts(userId, days = 2) {
    const result = await this.request(`/get_alerts?user_id=${userId}&days=${days}`);
    
    // Ensure alerts is always an array
    if (result.success && !Array.isArray(result.alerts)) {
      result.alerts = [];
    }
    
    return result;
  }

  // User data
  async getLoyaltyPoints(userId) {
    const result = await this.request(`/get_loyalty?user_id=${userId}`);
    
    // Backend returns 'loyalty_points' field, map it to 'points' for consistency
    if (result.success && result.loyalty_points !== undefined) {
      result.points = result.loyalty_points;
    }
    
    return result;
  }

  async getUserImpact(userId) {
    return this.request(`/user_impact?user_id=${userId}`);
  }

  // Predictions
  async predictShelfLife(itemName, category, storageType) {
    return this.request('/predict_shelf_life', {
      method: 'POST',
      body: JSON.stringify({
        item_name: itemName,
        category: category,
        storage_type: storageType
      }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/');
  }

  // Inventory operations
  async getInventory(params = {}) {
    let endpoint = '/get_inventory';
    const queryParams = new URLSearchParams();
    
    // Add query parameters if provided
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.expiring_soon) {
      queryParams.append('expiring_soon', 'true');
    }
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    
    const result = await this.request(endpoint);
    
    // Ensure inventory is always an array
    if (result.success && !Array.isArray(result.inventory)) {
      result.inventory = [];
    }
    
    return result;
  }

  // Utility methods for ProductCard
  formatPrice(price) {
    return `$${(price || 0).toFixed(2)}`;
  }

  formatDate(date) {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getExpiryStatus(expiryDate) {
    const daysLeft = this.getDaysUntilExpiry(expiryDate);
    if (daysLeft === null) return { status: 'unknown', text: 'Unknown' };
    
    if (daysLeft <= 0) return { status: 'expired', text: 'Expired' };
    if (daysLeft <= 2) return { status: 'critical', text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` };
    if (daysLeft <= 7) return { status: 'warning', text: `${daysLeft} days left` };
    return { status: 'good', text: `${daysLeft} days left` };
  }

  getStockStatus(stock) {
    const stockNum = stock || 0;
    if (stockNum === 0) return { status: 'out', text: 'Out of Stock' };
    if (stockNum <= 5) return { status: 'low', text: 'Low Stock' };
    return { status: 'good', text: 'In Stock' };
  }

  calculateDiscount(originalPrice, discountedPrice) {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }
}

export const apiService = new ApiService();
