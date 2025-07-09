import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { 
  ShoppingCart, 
  User, 
  Leaf, 
  Menu, 
  X, 
  AlertCircle,
  Award,
  Gift
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { user, getCriticalAlerts } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = getCartItemCount();
  const criticalAlerts = getCriticalAlerts();

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Inventory', href: '/inventory', icon: null },
    { name: 'Alerts', href: '/alerts', icon: AlertCircle, badge: criticalAlerts.length },
    { name: 'Dashboard', href: '/dashboard', icon: Award },
    { name: 'Redeem Points', href: '/redeem-points', icon: Gift },
  ];

  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <Leaf size={32} />
            <span>FreshGuard 2.0</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-menu">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActiveLink(item.href) ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon size={16} />}
                    {item.name}
                    {item.badge > 0 && (
                      <span className="badge badge-danger" style={{ marginLeft: '0.25rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* User Info */}
            <div className="user-info">
              <User size={16} />
              <span>{user.name}</span>
              <span className="badge badge-primary">{user.loyaltyPoints} pts</span>
            </div>

            {/* Cart */}
            <Link to="/cart" className="cart-badge">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="badge">{cartItemCount}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="nav-menu mobile-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActiveLink(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon size={16} />}
                    {item.name}
                    {item.badge > 0 && (
                      <span className="badge badge-danger" style={{ marginLeft: '0.25rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="nav-link" style={{ pointerEvents: 'none' }}>
              <span className="flex items-center gap-2">
                <User size={16} />
                {user.name}
                <span className="badge badge-primary">{user.loyaltyPoints} pts</span>
              </span>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
