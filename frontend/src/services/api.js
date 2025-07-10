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
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health & Status
  async healthCheck() {
    return await this.request('/health');
  }

  async getApiInfo() {
    return await this.request('/');
  }

  // Inventory operations
  async getInventory(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.expiring_soon !== undefined) params.append('expiring_soon', filters.expiring_soon);
    if (filters.grouped !== undefined) params.append('grouped', filters.grouped);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/get_inventory?${queryString}` : '/get_inventory';
    
    return await this.request(endpoint);
  }

  async getGroupedInventory(nearExpiryThreshold = 5) {
    return await this.request(`/get_grouped_inventory?near_expiry_threshold=${nearExpiryThreshold}`);
  }

  async getProductDetails(productName) {
    return await this.request(`/get_product_details?product_name=${encodeURIComponent(productName)}`);
  }

  async getInventoryItemsForProduct(productName) {
    return await this.request(`/inventory_items_for_product?product_name=${encodeURIComponent(productName)}`);
  }

  // Cart operations
  async addToCart(userId, itemQuery, quantity) {
    const payload = {
      user_id: userId,
      item_query: itemQuery,
      quantity: quantity
    };
    
    return await this.request('/add_to_cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async addReplacementToCart(userId, originalItemId, replacement, quantity) {
    return await this.request('/add_replacement_to_cart', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        original_item_id: originalItemId,
        replacement: replacement,
        quantity: quantity
      }),
    });
  }

  async removeFromCart(userId, itemId, quantity = null) {
    const payload = {
      user_id: userId,
      item_id: itemId
    };
    
    if (quantity !== null) {
      payload.quantity = quantity;
    }

    return await this.request('/remove_from_cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCart(userId) {
    return await this.request(`/get_cart?user_id=${encodeURIComponent(userId)}`);
  }

  async clearCart(userId) {
    return await this.request('/clear_cart', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async checkout(userId, clearCart = true) {
    return await this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        clear_cart: clearCart
      }),
    });
  }

  // Smart Features & Recommendations
  async suggestReplacements(productName, nearExpiryThreshold = 5) {
    return await this.request('/suggest_replacements', {
      method: 'POST',
      body: JSON.stringify({
        product_name: productName,
        near_expiry_threshold: nearExpiryThreshold
      }),
    });
  }

  async suggestCartItem(productName) {
    return await this.request('/suggest_cart_item', {
      method: 'POST',
      body: JSON.stringify({
        product_name: productName
      }),
    });
  }

  async findFreshestItem(productName, minDaysThreshold = 3) {
    return await this.request('/find_freshest_item', {
      method: 'POST',
      body: JSON.stringify({
        product_name: productName,
        min_days_threshold: minDaysThreshold
      }),
    });
  }

  // Alerts & Notifications
  async getAlerts(userId, days = 2) {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('days', days);
    
    const queryString = params.toString();
    return await this.request(`/get_alerts?${queryString}`);
  }

  // Loyalty & Impact
  async getLoyaltyPoints(userId) {
    return await this.request(`/get_loyalty?user_id=${encodeURIComponent(userId)}`);
  }

  async addLoyaltyPoints(userId, points) {
    return await this.request('/add_loyalty_points', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        points: points
      }),
    });
  }

  async getUserImpact(userId) {
    return await this.request(`/user_impact?user_id=${encodeURIComponent(userId)}`);
  }

  async updateImpactDash(userId, metrics, updateType = 'add') {
    return await this.request('/update_impact_dash', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        update_type: updateType,
        ...metrics
      }),
    });
  }

  async getProductImpactPreview(itemName, quantity = 1, category = null) {
    return await this.request('/get_product_impact_preview', {
      method: 'POST',
      body: JSON.stringify({
        item_name: itemName,
        quantity: quantity,
        category: category
      }),
    });
  }

  // Predictions & Analysis
  async predictShelfLife(itemName, category, storageType = 'refrigerated') {
    return await this.request('/predict_shelf_life', {
      method: 'POST',
      body: JSON.stringify({
        item_name: itemName,
        category: category,
        storage_type: storageType
      }),
    });
  }

  async enhancedPredictShelfLife(sampleData) {
    return await this.request('/enhanced_predict_shelf_life', {
      method: 'POST',
      body: JSON.stringify(sampleData),
    });
  }

  async calculateDaysUntilExpiry(expiryDate) {
    return await this.request('/days_until_expiry', {
      method: 'POST',
      body: JSON.stringify({
        expiry_date: expiryDate
      }),
    });
  }

  // Configuration
  async loadProductThresholds() {
    return await this.request('/load_product_thresholds');
  }

  async getProductThreshold(productName) {
    return await this.request(`/get_product_threshold?product_name=${encodeURIComponent(productName)}`);
  }

  // Testing & Debug
  async testFunctions(userId) {
    return await this.request('/test_functions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId
      }),
    });
  }

  // Enhanced testing methods for development
  async testAllEndpoints() {
    const testUserId = 'test_user_123';
    const results = {};

    try {
      // Test health endpoints
      results.health = await this.healthCheck();
      results.apiInfo = await this.getApiInfo();

      // Test inventory
      results.inventory = await this.getInventory();
      results.groupedInventory = await this.getGroupedInventory();
      
      // Test cart operations
      results.cart = await this.getCart(testUserId);
      results.loyaltyPoints = await this.getLoyaltyPoints(testUserId);
      results.userImpact = await this.getUserImpact(testUserId);
      results.alerts = await this.getAlerts(testUserId);

      // Test predictions
      results.shelfLifePrediction = await this.predictShelfLife('Milk', 'Dairy');

      // Test configuration
      results.productThresholds = await this.loadProductThresholds();

      console.log('All endpoint tests completed:', results);
      return { success: true, results };
      
    } catch (error) {
      console.error('Endpoint test failed:', error);
      return { success: false, error: error.message, partialResults: results };
    }
  }

  // Convenience methods for common operations
  async getExpiringItems(days = 2) {
    const inventory = await this.getInventory({ expiring_soon: true });
    return inventory.inventory?.filter(item => item.days_left <= days) || [];
  }

  async getItemsByCategory(category) {
    return await this.getInventory({ category });
  }

  async getDiscountedItems() {
    const inventory = await this.getInventory();
    return inventory.inventory?.filter(item => 
      (item.effective_discount && item.effective_discount > 0) || 
      (item.max_discount && item.max_discount > 0) ||
      (item.discount && item.discount > 0)
    ) || [];
  }

  async getCartValue(userId) {
    const cart = await this.getCart(userId);
    return cart.total || 0;
  }

  async getRecommendationsForProduct(productName) {
    try {
      const [suggestions, replacements] = await Promise.all([
        this.suggestCartItem(productName),
        this.suggestReplacements(productName)
      ]);
      
      return {
        bestItem: suggestions.best_item,
        warning: suggestions.warning,
        incentive: suggestions.incentive,
        replacements: replacements.replacements || []
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        bestItem: null,
        warning: null,
        incentive: null,
        replacements: []
      };
    }
  }

  // Smart cart operations with suggestions
  async addToCartWithSuggestions(userId, itemQuery, quantity) {
    try {
      // The /add_to_cart endpoint already provides smart suggestions and replacements
      // No need for separate suggestion call - just use the main endpoint
      const result = await this.addToCart(userId, itemQuery, quantity);
      
      // The backend already includes replacements and suggestions in the response
      return result;
    } catch (error) {
      console.error('Error in addToCartWithSuggestions:', error);
      return { 
        success: false, 
        error: 'Failed to add item to cart',
        message: error.message || 'An error occurred while adding the item'
      };
    }
  }

  async updateCartQuantity(userId, itemId, quantity) {
    return await this.request('/update_cart_quantity', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        quantity: quantity
      }),
    });
  }

  // Loyalty Points API Methods
  async getRedeemableItems() {
    return await this.request('/api/loyalty/redeemable-items');
  }

  async redeemPoints(userId, itemId, pointsCost) {
    return await this.request('/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        points_cost: pointsCost
      }),
    });
  }

  // Admin Authentication 
  async verifyAdminToken(token) {
    // This would be implemented with a real backend
    // For demo purposes, we'll just return success
    return { success: true };
  }

  async adminLogin(credentials) {
    // In a real implementation this would call the backend
    // For demo purposes, we'll just simulate a successful login
    if (credentials.username === 'admin' && credentials.password === 'walmart123') {
      return {
        success: true,
        admin: {
          id: 'admin-1',
          name: 'Store Admin',
          email: 'admin@walmart.com',
          role: 'store_admin'
        },
        token: 'mock-jwt-token-for-admin'
      };
    } else {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
  }

  // Admin Dashboard
  async getAdminDashboard() {
    // This would be implemented with a real backend
    // For now, we'll return mock data
    return {
      success: true,
      data: {
        sales: {
          today: 2450.75,
          week: 15780.50,
          month: 64320.25,
          growth: 12.5
        },
        inventory: {
          totalItems: 1248,
          lowStock: 42,
          expiringItems: 87
        },
        wasteReduction: {
          itemsSaved: 324,
          carbonSaved: 876.4,
          weightSaved: 1540.6
        },
        customers: {
          activeUsers: 875,
          cartAbandonment: 23.4,
          replacementRate: 68.7
        }
      }
    };
  }

  // Admin Inventory Management
  async getInventoryStats() {
    // Mock implementation
    return {
      success: true,
      data: {
        total: 1248,
        categories: {
          produce: 345,
          dairy: 187,
          meat: 102,
          bakery: 95,
          frozen: 221,
          pantry: 298
        },
        expiringItems: {
          today: 12,
          thisWeek: 75,
          nextWeek: 132
        }
      }
    };
  }

  // Utility methods
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
    if (daysLeft === null) return { status: 'unknown', text: 'Unknown', class: 'text-gray-500' };
    
    if (daysLeft <= 0) return { status: 'expired', text: 'Expired', class: 'text-red-600' };
    if (daysLeft <= 2) return { status: 'critical', text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, class: 'text-red-600' };
    if (daysLeft <= 7) return { status: 'warning', text: `${daysLeft} days left`, class: 'text-yellow-600' };
    return { status: 'good', text: `${daysLeft} days left`, class: 'text-green-600' };
  }

  calculateDiscount(originalPrice, discountedPrice) {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price) {
    if (typeof price !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Debug: Verify methods are available
console.log('ApiService methods available:', {
  getDaysUntilExpiry: typeof apiService.getDaysUntilExpiry,
  getExpiryStatus: typeof apiService.getExpiryStatus,
  calculateDiscount: typeof apiService.calculateDiscount,
  formatDate: typeof apiService.formatDate,
  formatPrice: typeof apiService.formatPrice
});

export default apiService;