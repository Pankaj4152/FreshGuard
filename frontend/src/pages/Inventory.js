import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';
import ReplacementModal from '../components/ReplacementModal';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Package, 
  AlertTriangle,
  Clock,
  TrendingDown
} from 'lucide-react';

const Inventory = ({ backendStatus, addToast }) => {
  const { user } = useUser();
  const { addToCart, addReplacementToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'individual'
  const [showSmartFeatures, setShowSmartFeatures] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [apiStatus, setApiStatus] = useState(null); // Add missing state
  const [replacementModal, setReplacementModal] = useState({
    isOpen: false,
    replacement: null
  });
  const [notifications, setNotifications] = useState([]);

  const categories = [
    'All Categories',
    'Produce',
    'Dairy',
    'Meat',
    'Bakery',
    'Seafood',
    'Frozen',
    'Pantry'
  ];

  useEffect(() => {
    loadProducts();
    checkApiHealth();
  }, [viewMode, showSmartFeatures]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy, showExpiringSoon]);

  const checkApiHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      setApiStatus(health);
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus({ status: 'unhealthy', error: error.message });
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Use smart inventory loading based on view mode
      let response;
      if (viewMode === 'grouped' && showSmartFeatures) {
        response = await apiService.getGroupedInventory();
        if (!response.success) {
          // Fallback to regular inventory
          response = await apiService.getInventory({ grouped: true });
        }
      } else {
        response = await apiService.getInventory({ 
          grouped: false,
          expiring_soon: showExpiringSoon 
        });
      }
      
      if (response.success) {
        // Handle different response structures
        const inventory = response.inventory || response.all_grouped || [];
        setProducts(Array.isArray(inventory) ? inventory : []);
        
        // Check for warnings or notifications
        if (response.grouping_enabled === false) {
          addNotification('info', 'Inventory grouping not available - showing individual items');
        }
        
        if (showDebug) {
          console.log('Loaded products:', inventory);
          console.log('Response metadata:', {
            grouped: response.grouped,
            count: response.count,
            grouping_enabled: response.grouping_enabled
          });
        }
      } else {
        addNotification('error', response.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      addNotification('error', 'Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const showSuccess = (message) => {
    if (addToast) {
      addToast(message, 'success');
    } else {
      addNotification('success', message);
    }
  };

  const showError = (message) => {
    if (addToast) {
      addToast(message, 'error');
    } else {
      addNotification('error', message);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const filterAndSortProducts = () => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        const productName = product.item_name || '';
        const productCategory = product.category || '';
        const searchLower = searchQuery.toLowerCase();
        
        return productName.toLowerCase().includes(searchLower) ||
               productCategory.toLowerCase().includes(searchLower);
      });
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => {
        if (!product) return false;
        return product.category === selectedCategory;
      });
    }

    // Filter by expiring soon
    if (showExpiringSoon) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        const days = getDaysUntilExpiry(product.expiry_date);
        return days <= 2;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case 'name':
          const nameA = a.item_name || '';
          const nameB = b.item_name || '';
          return nameA.localeCompare(nameB);
        case 'price':
          const priceA = a.discounted_price || a.price_per_unit || 0;
          const priceB = b.discounted_price || b.price_per_unit || 0;
          return priceA - priceB;
        case 'expiry':
          const expiryA = a.expiry_date || '9999-12-31';
          const expiryB = b.expiry_date || '9999-12-31';
          return new Date(expiryA) - new Date(expiryB);
        case 'discount':
          const discountA = a.effective_discount || 0;
          const discountB = b.effective_discount || 0;
          return discountB - discountA;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product, quantity, showSmartFeatures = true) => {
    if (!product || !product.item_id) {
      showError('Invalid product');
      return { success: false };
    }

    console.log('HandleAddToCart called with:', { product, quantity, showSmartFeatures });

    try {
      const userId = user?.id || 'user1';
      const productName = product.item_name || product.name || 'Product';
      
      // Use smart cart features if enabled
      let result;
      if (showSmartFeatures) {
        console.log('Using smart features - calling addToCartWithSuggestions');
        result = await apiService.addToCartWithSuggestions(userId, productName, quantity || 1);
      } else {
        console.log('Using regular add to cart');
        result = await addToCart(userId, productName, quantity || 1);
      }
      
      console.log('Add to cart result:', result);
      
      if (result.success) {
        let successMessage = `${productName} added to cart!`;
        
        // Add smart feature messaging
        if (result.hasReplacements || result.replacement) {
          successMessage += ' Smart alternatives available!';
        }
        if (product.effective_discount > 0) {
          successMessage += ` Save ${product.effective_discount}%!`;
        }
        
        showSuccess(successMessage);
        
        // Handle replacement suggestions - check multiple possible formats
        const hasReplacements = result.hasReplacements || result.replacement;
        const replacements = result.replacements || (result.replacement ? [result.replacement] : []);
        
        console.log('Replacement check:', { hasReplacements, replacementsCount: replacements.length });
        
        if (hasReplacements && replacements.length > 0) {
          console.log('Opening replacement modal with:', replacements[0]);
          setReplacementModal({
            isOpen: true,
            replacement: {
              ...replacements[0], // Show first replacement
              original: product,
              alternatives: replacements,
              warning: result.warning,
              incentive: result.incentive
            }
          });
        } else {
          console.log('No replacement suggestions to show');
        }
      } else {
        // Handle replacement offers from backend (alternative format)
        if (result.replacement) {
          console.log('Got replacement suggestion from failed add to cart:', result.replacement);
          setReplacementModal({
            isOpen: true,
            replacement: {
              ...result.replacement,
              original: product
            }
          });
        } else {
          const errorMsg = result.message || result.error || 'Failed to add item to cart';
          console.error('Add to cart failed:', errorMsg);
          showError(errorMsg);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart');
      return { success: false };
    }
  };

  const handleReplacementAccept = async (replacement) => {
    try {
      const originalItemId = replacement.original?.item_id;
      const result = await addReplacementToCart('user1', originalItemId, replacement, 1);
      
      if (result.success) {
        const replacementName = replacement.item_name || replacement.name || 'Replacement';
        showSuccess(`Replaced with ${replacementName}! +10 loyalty points earned!`);
      } else {
        showError(result.message || 'Failed to add replacement');
      }
    } catch (error) {
      console.error('Error adding replacement:', error);
      showError('Failed to add replacement');
    }
    
    setReplacementModal({ isOpen: false, replacement: null });
  };

  const handleReplacementDecline = () => {
    setReplacementModal({ isOpen: false, replacement: null });
  };

  const getExpiringCount = () => {
    if (!Array.isArray(products)) return 0;
    
    return products.filter(product => {
      if (!product) return false;
      const days = getDaysUntilExpiry(product.expiry_date);
      return days <= 2;
    }).length;
  };

  const getDiscountedCount = () => {
    if (!Array.isArray(products)) return 0;
    
    return products.filter(product => {
      if (!product) return false;
      return (product.effective_discount || 0) > 0;
    }).length;
  };

  return (
    <div className="inventory-page">
      {/* Notifications */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type} position-fixed`}
          style={{ top: '20px', right: '20px', zIndex: 1050, maxWidth: '400px' }}
        >
          {notification.message}
        </div>
      ))}
      
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="text-primary font-bold">Product Inventory</h1>
            <p className="text-secondary">
              Discover fresh products with smart pricing and sustainability features
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-auto">
            <div className="card bg-light border-0">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2">
                  <Package className="text-primary" size={20} />
                  <span className="h5 mb-0">{products.length}</span>
                </div>
                <div className="text-muted small">Total Products</div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card bg-light border-0">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2">
                  <AlertTriangle className="text-warning" size={20} />
                  <span className="h5 mb-0">{getExpiringCount()}</span>
                </div>
                <div className="text-muted small">Expiring Soon</div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card bg-light border-0">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2">
                  <TrendingDown className="text-success" size={20} />
                  <span className="h5 mb-0">{getDiscountedCount()}</span>
                </div>
                <div className="text-muted small">On Sale</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">
                    <Search size={16} className="me-1" />
                    Search Products
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <Filter size={16} className="me-1" />
                    Category
                  </label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <SlidersHorizontal size={16} className="me-1" />
                    Sort By
                  </label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="expiry">Expiry Date</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>
              
              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">
                    <Clock size={16} className="me-1" />
                    Quick Filter
                  </label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="expiringSoon"
                      checked={showExpiringSoon}
                      onChange={(e) => setShowExpiringSoon(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="expiringSoon">
                      Expiring Soon
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Smart Features Controls */}
            <div className="row align-items-center mt-3 pt-3 border-top">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <Package size={16} className="me-1" />
                    View Mode
                  </label>
                  <select
                    className="form-select"
                    value={viewMode}
                    onChange={(e) => {
                      setViewMode(e.target.value);
                      // Reload products when view mode changes
                      setTimeout(loadProducts, 100);
                    }}
                  >
                    <option value="grouped">Smart Grouped</option>
                    <option value="individual">Individual Items</option>
                  </select>
                </div>
              </div>
              
              {/* <div className="col-md-3">
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="smartFeatures"
                      checked={showSmartFeatures}
                      onChange={(e) => setShowSmartFeatures(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="smartFeatures">
                      🤖 Smart Features
                    </label>
                  </div>
                  <small className="text-muted">AI-powered recommendations and replacements</small>
                </div>
              </div> */}
              
              <div className="col-md-2">
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="debug"
                      checked={showDebug}
                      onChange={(e) => setShowDebug(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="debug">
                      🐛 Debug
                    </label>
                  </div>
                  <small className="text-muted">Show debug info</small>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="smart-features-info">
                  <small className="text-success">
                    {viewMode === 'grouped' ? '✅ Using grouped inventory' : '📝 Showing individual items'} • 
                    {showSmartFeatures ? ' 🤖 Smart features enabled' : ' 🔧 Basic mode'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="card mb-4 border-warning">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">🐛 Debug Information</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6>Settings</h6>
                  <ul className="list-unstyled small">
                    <li>Smart Features: {showSmartFeatures ? '✅ Enabled' : '❌ Disabled'}</li>
                    <li>View Mode: {viewMode}</li>
                    <li>Total Products: {products.length}</li>
                    <li>Filtered Products: {filteredProducts.length}</li>
                    <li>Backend Status: {backendStatus?.status || 'Unknown'}</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>Replacement Modal</h6>
                  <ul className="list-unstyled small">
                    <li>Modal Open: {replacementModal.isOpen ? '✅ Yes' : '❌ No'}</li>
                    <li>Has Replacement: {replacementModal.replacement ? '✅ Yes' : '❌ No'}</li>
                    {replacementModal.replacement && (
                      <li>Replacement Item: {replacementModal.replacement.item_name || 'N/A'}</li>
                    )}
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>Test Actions</h6>
                  <button 
                    className="btn btn-sm btn-warning mb-2"
                    onClick={() => {
                      console.log('Current state:', { 
                        showSmartFeatures, 
                        replacementModal, 
                        products: products.length 
                      });
                    }}
                  >
                    Log State
                  </button>
                  <br />
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => {
                      setReplacementModal({
                        isOpen: true,
                        replacement: {
                          item_name: "Test Cheese",
                          discounted_price: 4.99,
                          days_until_expiry: 2,
                          urgency_level: "warning",
                          suggested_message: "This is a test replacement",
                          original: { item_name: "Original Cheese", discounted_price: 5.99 }
                        }
                      });
                    }}
                  >
                    Test Modal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '40px', height: '40px' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="text-secondary mb-0">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              {showExpiringSoon && (
                <div className="alert alert-warning mb-0 py-2 px-3">
                  <AlertTriangle size={16} className="me-2" />
                  Showing only items expiring within 2 days
                </div>
              )}
            </div>
            
            <div className="row g-3">
              {filteredProducts.map((product) => (
                <div key={product.item_id} className="col-md-6 col-lg-4 col-xl-3">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    showSmartFeatures={showSmartFeatures}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <Package size={48} className="text-secondary mb-3" />
            <h3>No products found</h3>
            <p className="text-secondary">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setShowExpiringSoon(false);
              }}
              className="btn btn-primary mt-3"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Replacement Modal */}
      <ReplacementModal
        isOpen={replacementModal.isOpen}
        replacement={replacementModal.replacement}
        onAccept={handleReplacementAccept}
        onDecline={handleReplacementDecline}
        onClose={handleReplacementDecline}
      />
    </div>
  );
};

export default Inventory;
