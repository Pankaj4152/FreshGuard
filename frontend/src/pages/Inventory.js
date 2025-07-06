import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { apiService } from '../services/api';
import ProductCard from '../components/ProductCard';
import ReplacementModal from '../components/ReplacementModal';
import { useToast } from '../components/Toast';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Package, 
  AlertTriangle,
  Clock,
  TrendingDown
} from 'lucide-react';

const Inventory = () => {
  const { user } = useUser();
  const { addToCart, addReplacementToCart } = useCart();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'individual'
  const [showSmartFeatures, setShowSmartFeatures] = useState(true);
  const [showDebug, setShowDebug] = useState(false); // Add debug toggle
  const [replacementModal, setReplacementModal] = useState({
    isOpen: false,
    replacement: null
  });

  const categories = [
    'All Categories',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Meat',
    'Bakery',
    'Seafood',
    'Frozen',
    'Pantry'
  ];

  useEffect(() => {
    loadProducts();
  }, [viewMode, showSmartFeatures]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy, showExpiringSoon]);

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
        // Ensure we have an array and add safety checks
        const inventory = Array.isArray(response.inventory) ? response.inventory : 
                         Array.isArray(response.all_grouped) ? response.all_grouped : [];
        setProducts(inventory);
        
        // Add metadata about grouping
        if (response.isGrouped || response.grouping_enabled) {
          console.log('Using grouped inventory with smart features');
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Failed to load products');
      setProducts([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterAndSortProducts = () => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Filter by search query - FIX: Use item_name instead of name
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

    // Sort products - FIX: Use item_name and add safety checks
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

  const handleAddToCart = async (product, quantity) => {
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
      const result = await addReplacementToCart('101', replacement, 1);
      
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
      <ToastContainer />
      
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1>Product Inventory</h1>
            <p className="text-secondary">
              Discover fresh products with smart pricing and sustainability features
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-auto">
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <Package className="text-primary" size={20} />
                <span className="stat-value">{products.length}</span>
              </div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="col-auto">
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-warning" size={20} />
                <span className="stat-value">{getExpiringCount()}</span>
              </div>
              <div className="stat-label">Expiring Soon</div>
            </div>
          </div>
          <div className="col-auto">
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-success" size={20} />
                <span className="stat-value">{getDiscountedCount()}</span>
              </div>
              <div className="stat-label">On Sale</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">
                    <Search size={16} className="mr-1" />
                    Search Products
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">
                    <Filter size={16} className="mr-1" />
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
                <div className="form-group">
                  <label className="form-label">
                    <SlidersHorizontal size={16} className="mr-1" />
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
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} className="mr-1" />
                    Quick Filter
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showExpiringSoon}
                      onChange={(e) => setShowExpiringSoon(e.target.checked)}
                    />
                    <span>Expiring Soon</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Smart Features Controls */}
            <div className="row align-items-center mt-3 pt-3 border-top">
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">
                    <Package size={16} className="mr-1" />
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
              
              <div className="col-md-3">
                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showSmartFeatures}
                      onChange={(e) => setShowSmartFeatures(e.target.checked)}
                    />
                    <span>🤖 Smart Features</span>
                  </label>
                  <small className="text-muted">AI-powered recommendations and replacements</small>
                </div>
              </div>
              
              <div className="col-md-2">
                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showDebug}
                      onChange={(e) => setShowDebug(e.target.checked)}
                    />
                    <span>🐛 Debug</span>
                  </label>
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
            <div className="spinner spinner-primary" style={{ width: '40px', height: '40px' }}></div>
            <p className="mt-3">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-secondary">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              {showExpiringSoon && (
                <div className="alert alert-warning" style={{ marginBottom: 0, padding: '0.5rem 1rem' }}>
                  <AlertTriangle size={16} className="mr-2" />
                  Showing only items expiring within 2 days
                </div>
              )}
            </div>
            
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.item_id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showSmartFeatures={showSmartFeatures}
                />
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
