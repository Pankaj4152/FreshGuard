import React, { useState } from 'react';
import { 
  Calendar, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Clock,
  Star,
  Zap,
  Leaf,
  Plus,
  Minus
} from 'lucide-react';

const ProductCard = ({ product, onAddToCart, showSmartFeatures = true }) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  if (!product) return null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product.current_stock || 0) <= 0 || isAddingToCart) {
      return;
    }
    
    setLoading(true);
    setIsAddingToCart(true);
    
    try {
      // Pass the product and selected quantity to the parent handler
      await onAddToCart(product, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
      // Prevent rapid clicking by adding a small delay
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const maxStock = product.current_stock || 0;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    setQuantity(validQuantity);
  };

  const incrementQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleQuantityChange(quantity - 1);
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

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    if (daysLeft === null) return { status: 'unknown', text: 'Unknown', class: 'text-gray-500' };
    
    if (daysLeft <= 0) return { status: 'expired', text: 'Expired', class: 'text-red-600' };
    if (daysLeft <= 2) return { status: 'critical', text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, class: 'text-red-600' };
    if (daysLeft <= 7) return { status: 'warning', text: `${daysLeft} days left`, class: 'text-yellow-600' };
    return { status: 'good', text: `${daysLeft} days left`, class: 'text-green-600' };
  };

  const getStockStatus = (stock) => {
    const stockNum = stock || 0;
    if (stockNum === 0) return { status: 'out', text: 'Out of Stock', class: 'text-red-600' };
    if (stockNum <= 5) return { status: 'low', text: 'Low Stock', class: 'text-yellow-600' };
    return { status: 'good', text: 'In Stock', class: 'text-green-600' };
  };

  const formatPrice = (price) => {
    return `$${(price || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  const calculateDiscount = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  // Use the correct property names from backend
  const productName = product.item_name || product.name || 'Unknown Product';
  const originalPrice = product.price_per_unit || 0;
  const finalPrice = product.discounted_price || originalPrice;
  const discountPercent = calculateDiscount(originalPrice, finalPrice);
  const expiryStatus = getExpiryStatus(product.expiry_date);
  const stockStatus = getStockStatus(product.current_stock);
  const hasDiscount = discountPercent > 0;
  
  // Check if this is a grouped product
  const isGrouped = product.total_variants > 1;
  const hasNearExpiry = product.has_near_expiry || false;
  
  // Smart feature indicators
  const hasSustainabilityBenefit = hasDiscount || expiryStatus.status === 'warning' || expiryStatus.status === 'critical';
  const isRecommended = product.is_recommended || product.freshness_score > 0.8;
  const isUrgent = expiryStatus.status === 'critical';

  return (
    <div className={`product-card ${isUrgent ? 'urgent' : ''} ${isRecommended ? 'recommended' : ''}`}>
      <div className="product-image">
        <span style={{ fontSize: '3rem' }}>
          {getProductIcon(product.category)}
        </span>
        
        {/* Smart feature badges */}
        <div className="product-badges">
          {/* {hasDiscount && (
            <div className="discount-badge">
              {discountPercent}% OFF
            </div>
          )} */}
          {isUrgent && (
            <div className="urgency-badge">
              <Zap size={12} />
              Urgent
            </div>
          )}
          {hasSustainabilityBenefit && !isUrgent && (
            <div className="sustainability-badge">
              <Leaf size={12} />
              Save Food
            </div>
          )}
          {isRecommended && (
            <div className="recommended-badge">
              <Star size={12} />
              Best Pick
            </div>
          )}
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">
          {productName}
          {isGrouped && (
            <span className="grouped-indicator" title={`${product.total_variants} variants available`}>
              <Package size={12} style={{ marginLeft: '4px' }} />
            </span>
          )}
        </h3>
        <div className="product-details">
          {/* <span className="product-id">ID: {product.item_id}</span> */}
          <span className="product-category">{product.category}</span>
          {isGrouped && (
            <span className="variant-count" title="Multiple freshness options available">
              {product.total_variants} variants
            </span>
          )}
        </div>
        
        <div className="product-price">
          {hasDiscount ? (
            <div className="price-with-discount">
              <div className="price-line">
                <span className="price-original strikethrough">
                  {formatPrice(originalPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="discount-badge">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <div className="price-current-line">
                <span className="price-current emphasized">
                  {formatPrice(finalPrice)}
                </span>
                <span className="savings-text">
                  Save {formatPrice(originalPrice - finalPrice)}
                </span>
              </div>
            </div>
          ) : (
            <span className="price-current emphasized">
              {formatPrice(finalPrice)}
            </span>
          )}
          {isGrouped && product.price_range && product.price_range.min !== product.price_range.max && (
            <small className="price-range">
              Range: {formatPrice(product.price_range.min)} - {formatPrice(product.price_range.max)}
            </small>
          )}
        </div>
        
        <div className="product-meta">
          <div className={`expiry-info ${expiryStatus.status === 'critical' ? 'expiry-critical' : 
                          expiryStatus.status === 'warning' ? 'expiry-warning' : ''}`}>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Expires: {formatDate(product.expiry_date)}</span>
            </div>
            <small className={expiryStatus.class}>{expiryStatus.text}</small>
          </div>
          
          <div className={`stock-info ${stockStatus.status === 'low' ? 'stock-low' : ''}`}>
            <div className="flex items-center gap-1">
              <Package size={14} />
              <span>{stockStatus.text}</span>
            </div>
            <small>{product.current_stock || 0} left</small>
          </div>
        </div>

        {/* Smart selection and sustainability messages */}
        {hasDiscount && (
          <div className="sustainability-badge">
            <Star size={14} />
            <span>Eco-friendly choice • Earn extra points</span>
          </div>
        )}
        
        {/* {isGrouped && hasNearExpiry && (
          <div className="replacement-notice">
            <Clock size={14} />
            <span>Near-expiry alternatives available with discounts</span>
          </div>
        )} */}
        
        <div className="product-actions">
          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button 
              className="quantity-btn"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || loading || isAddingToCart}
              title="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="quantity-display">{quantity}</span>
            <button 
              className="quantity-btn"
              onClick={incrementQuantity}
              disabled={quantity >= (product.current_stock || 0) || loading || isAddingToCart}
              title="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button 
            className={`btn btn-primary btn-add-to-cart ${
              (product.current_stock || 0) <= 0 ? 'btn-disabled' : ''
            } ${loading || isAddingToCart ? 'btn-loading' : ''}`}
            onClick={handleAddToCart}
            disabled={(product.current_stock || 0) <= 0 || loading || isAddingToCart}
            title={isGrouped ? "We'll select the freshest available item for you" : "Add to cart"}
          >
            <ShoppingCart size={16} />
            {loading || isAddingToCart ? 'Adding...' : 
             (product.current_stock || 0) <= 0 ? 'Out of Stock' : 
             isGrouped ? `Add ${quantity} Fresh Item${quantity > 1 ? 's' : ''}` : 
             hasSustainabilityBenefit ? `Save & Add ${quantity}` : `Add ${quantity} to Cart`}
          </button>
          
          {/* Smart messaging */}
          {/* {showSmartFeatures && hasSustainabilityBenefit && (
            <div className="sustainability-message">
              <Leaf size={12} />
              <span>Help reduce waste • Earn bonus points</span>
            </div>
          )} */}
          
          {isUrgent && (product.current_stock || 0) > 0 && (
            <div className="urgent-notice">
              <AlertTriangle size={14} />
              <span>Act fast - expires in {getDaysUntilExpiry(product.expiry_date)} day{getDaysUntilExpiry(product.expiry_date) !== 1 ? 's' : ''}!</span>
            </div>
          )}
          
          {/* {isGrouped && showSmartFeatures && (
            <div className="smart-selection-notice">
              <Zap size={12} />
              <span>AI will pick the freshest item for you</span>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
