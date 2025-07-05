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
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy, showExpiringSoon]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInventory();
      if (response.success) {
        // Ensure we have an array and add safety checks
        const inventory = Array.isArray(response.inventory) ? response.inventory : [];
        setProducts(inventory);
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

    console.log('HandleAddToCart called with:', { product, quantity });

    try {
      const userId = user?.id || 'user1'; // Use user from context
      
      // Test both item_name and item_id to see which one works
      console.log('Attempting to add to cart:', {
        userId: userId,
        itemName: product.item_name,
        itemId: product.item_id,
        quantity: quantity || 1
      });

      // Try with item_name first (most likely to work)
      let result = await addToCart(userId, product.item_name, quantity || 1);
      console.log('Add to cart result (item_name):', result);
      
      // If that fails, try with item_id
      if (!result.success) {
        console.log('Trying with item_id instead...');
        result = await addToCart(userId, product.item_id, quantity || 1);
        console.log('Add to cart result (item_id):', result);
      }
      
      if (result.success) {
        const productName = product.item_name || product.name || 'Product';
        showSuccess(`${productName} added to cart!`);
        
        if (result.replacement) {
          setReplacementModal({
            isOpen: true,
            replacement: {
              ...result.replacement,
              original: product
            }
          });
        }
      } else {
        // Handle replacement offers
        if (result.replacement) {
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
          </div>
        </div>

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
