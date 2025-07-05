import React from 'react';
import { 
  Calendar, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Clock,
  Star
} from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product.current_stock || 0) <= 0) {
      return;
    }
    
    // Pass the product and quantity to the parent handler
    onAddToCart(product, 1);
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

  return (
    <div className="product-card">
      <div className="product-image">
        <span style={{ fontSize: '3rem' }}>
          {getProductIcon(product.category)}
        </span>
        {hasDiscount && (
          <div className="discount-badge">
            {discountPercent}% OFF
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{productName}</h3>
        <div className="product-details">
          <span className="product-id">ID: {product.item_id}</span>
          <span className="product-category">{product.category}</span>
        </div>
        
        <div className="product-price">
          <span className="price-current">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="price-original">
              {formatPrice(originalPrice)}
            </span>
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

        {/* Sustainability Badge */}
        {hasDiscount && (
          <div className="sustainability-badge">
            <Star size={14} />
            <span>Eco-friendly choice • Earn extra points</span>
          </div>
        )}
        
        <div className="product-actions">
          <button 
            className={`btn btn-primary btn-add-to-cart ${
              (product.current_stock || 0) <= 0 ? 'btn-disabled' : ''
            }`}
            onClick={handleAddToCart}
            disabled={(product.current_stock || 0) <= 0}
          >
            <ShoppingCart size={16} />
            {(product.current_stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          {expiryStatus.status === 'critical' && (product.current_stock || 0) > 0 && (
            <div className="urgent-notice">
              <AlertTriangle size={14} />
              <span>Quick Buy - Limited Time!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
