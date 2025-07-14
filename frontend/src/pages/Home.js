import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';
import ReplacementModal from '../components/ReplacementModal';
import { useToast } from '../components/Toast';
import { 
  Leaf, 
  ShoppingCart, 
  TrendingUp, 
  Award, 
  Users, 
  Globe, 
  AlertTriangle,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

const Home = () => {
  const { user, userImpact } = useUser();
  const { addToCart, addReplacementToCart } = useCart();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replacementModal, setReplacementModal] = useState({
    isOpen: false,
    replacement: null
  });

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInventory({ expiring_soon: true });
      if (response.success) {
        // Show first 6 items as featured
        setFeaturedProducts(response.inventory.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      showError('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, quantity) => {
    if (!product || !product.item_id) {
      showError('Invalid product');
      return { success: false };
    }

    console.log('Home: HandleAddToCart called with:', { product, quantity });

    try {
      const userId = user?.id || 'user1'; // Use user from context
      const productName = product.item_name || product.name || 'Product';
      
      // Use smart cart features for better UX
      const result = await apiService.addToCartWithSuggestions(userId, productName, quantity || 1);
      console.log('Smart add to cart result:', result);
      
      if (result.success) {
        const productName = product.item_name || product.name || 'Product';
        let successMessage = `${productName} added to cart!`;
        
        // Add smart feature messaging
        if (result.hasReplacements) {
          successMessage += ' Check out smart alternatives!';
        }
        if (product.effective_discount > 0) {
          successMessage += ` You're saving ${product.effective_discount}%!`;
        }
        
        showSuccess(successMessage);
        
        // Handle replacement suggestions
        if (result.hasReplacements && result.replacements?.length > 0) {
          setReplacementModal({
            isOpen: true,
            replacement: {
              ...result.replacements[0], // Show first replacement
              original: product,
              alternatives: result.replacements,
              warning: result.warning,
              incentive: result.incentive
            }
          });
        }
      } else {
        // Handle replacement offers from backend
        if (result.replacement) {
          setReplacementModal({
            isOpen: true,
            replacement: {
              ...result.replacement,
              original: product
            }
          });
        } else {
          showError(result.message || 'Failed to add item to cart');
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
    console.log('🔄 HOME: ACCEPT DISCOUNTED ITEM:', replacement);
    try {
      const originalItemId = replacement.original?.item_id;
      const userId = user?.id || 'test_user';
      
      const result = await addReplacementToCart(userId, originalItemId, replacement, 1);
      
      if (result.success) {
        const replacementName = replacement.item_name || replacement.name || 'Replacement';
        const discount = replacement.discount_given || replacement.effective_discount || 0;
        showSuccess(`✅ Added discounted ${replacementName}! ${discount}% off + bonus points!`);
      } else {
        console.error('Replacement failed:', result);
        showError(result.message || 'Failed to add replacement');
      }
    } catch (error) {
      console.error('Error adding replacement:', error);
      showError('Failed to add replacement');
    }
    
    setReplacementModal({ isOpen: false, replacement: null });
  };

  const handleReplacementDecline = async () => {
    console.log('🍃 HOME: KEEP FRESH ITEM - Adding original at full price');
    
    // Get the original item from the replacement modal
    const replacement = replacementModal.replacement;
    if (replacement?.original) {
      try {
        const userId = user?.id || 'test_user';
        const originalItem = replacement.original;
        
        // Add the original item at full price (no discount)
        const result = await addToCart(userId, originalItem.item_name || originalItem.name, 1);
        
        if (result.success) {
          showSuccess(`✅ Added fresh ${originalItem.item_name || originalItem.name} at regular price!`);
        } else {
          console.error('Failed to add original item:', result);
          showError(result.message || 'Failed to add item');
        }
      } catch (error) {
        console.error('Error adding original item:', error);
        showError('Failed to add item');
      }
    }
    
    setReplacementModal({ isOpen: false, replacement: null });
  };

  const features = [
    {
      icon: <TrendingUp />,
      title: 'Smart Inventory',
      description: 'AI-powered inventory management with predictive analytics for optimal freshness.'
    },
    {
      icon: <Target />,
      title: 'Dynamic Pricing',
      description: 'Automatic discounts on items nearing expiration to reduce waste and save money.'
    },
    {
      icon: <Award />,
      title: 'Loyalty Rewards',
      description: 'Earn points for sustainable choices and get rewarded for reducing food waste.'
    },
    {
      icon: <Sparkles />,
      title: 'Smart Recommendations',
      description: 'Get personalized suggestions for fresher alternatives when items expire soon.'
    },
    {
      icon: <Globe />,
      title: 'Impact Tracking',
      description: 'See your environmental impact and track food waste reduction over time.'
    },
    {
      icon: <Heart />,
      title: 'Retail with Purpose',
      description: 'Building a sustainable future through responsible shopping and waste reduction.'
    }
  ];

  return (
    <div className="home-page">
      <ToastContainer />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="text-center">
            <h1 className="hero-title">
              Welcome to FreshGuard 2.0
            </h1>
            <p className="hero-subtitle">
              AI-driven food waste reduction and customer engagement system for Walmart
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/inventory" className="btn btn-primary btn-lg">
                <ShoppingCart size={20} />
                Shop Now
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                <Award size={20} />
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{userImpact.items_saved}</span>
              <span className="stat-label">Items Saved</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{userImpact.food_saved_kg}kg</span>
              <span className="stat-label">Food Rescued</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{userImpact.co2_saved_kg}kg</span>
              <span className="stat-label">CO₂ Reduced</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">${userImpact.money_saved}</span>
              <span className="stat-label">Money Saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-secondary">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Retail with Purpose</h2>
            <p className="text-lg text-secondary">
              Building a sustainable and responsible future through innovative technology
            </p>
          </div>
          
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-5">
        <div className="container">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2>Featured Deals</h2>
              <p className="text-secondary">
                Items nearing expiration with special discounts - act fast!
              </p>
            </div>
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle size={20} />
              <span className="font-medium">Limited Time Offers</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner spinner-primary" style={{ width: '40px', height: '40px' }}></div>
              <p className="mt-3">Loading featured products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.item_id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showSmartFeatures={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-secondary">No featured products available at the moment.</p>
              <Link to="/inventory" className="btn btn-primary mt-3">
                Browse All Products
              </Link>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/inventory" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <div className="flex justify-center mb-3">
            <Leaf size={48} className="text-secondary" />
          </div>
          <h2>Join the Sustainability Movement</h2>
          <p className="text-lg mb-4" style={{ opacity: 0.9 }}>
            Every purchase makes a difference. Help us reduce food waste and build a better future.
          </p>
          <div className="flex justify-center gap-4">
            {/* <Link to="/alerts" className="btn btn-secondary">
              <AlertTriangle size={20} />
              View Alerts
            </Link> */}
            <Link to="/dashboard" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
              <Users size={20} />
              Track Impact
            </Link>
          </div>
        </div>
      </section>

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

export default Home;
