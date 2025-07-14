import React from 'react';
import { Leaf, Heart, Users, Globe, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={24} className="text-warning" />
              <h4>FreshGuard</h4>
            </div>
            <p>
              AI-driven food waste reduction and customer engagement system for Walmart. 
              Building a sustainable and responsible future through innovative technology.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Heart size={16} className="text-danger" />
              <span>Retail with Purpose</span>
            </div>
          </div>

          {/* Features Section */}
          <div className="footer-section">
            <h4>Features</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#smart-inventory">Smart Inventory Management</a></li>
              <li><a href="#predictive-analytics">Predictive Analytics</a></li>
              <li><a href="#dynamic-pricing">Dynamic Pricing</a></li>
              <li><a href="#loyalty-rewards">Loyalty Rewards</a></li>
              <li><a href="#sustainability">Sustainability Tracking</a></li>
            </ul>
          </div>

          {/* Impact Section */}
          <div className="footer-section">
            <h4>Our Impact</h4>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-success" />
              <span>Reducing Food Waste</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <span>Engaging Customers</span>
            </div>
            <p>
              Together, we're building a more sustainable future by reducing food waste 
              and creating meaningful customer experiences.
            </p>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h4>Get in Touch</h4>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} />
              <a href="mailto:freshguard@walmart.com">freshguard@walmart.com</a>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} />
              <a href="tel:+1-800-WALMART">1-800-WALMART</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Bentonville, AR</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="flex justify-between items-center">
            <div>
              <p>&copy; {currentYear} FreshGuard by Walmart. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#sustainability">Sustainability</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
