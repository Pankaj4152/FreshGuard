import React from 'react';
import { X, AlertTriangle, Clock, Package2 } from 'lucide-react';

const ReplacementModal = ({ isOpen, onClose, replacement, onAccept, onDecline }) => {
  if (!isOpen || !replacement) return null;

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

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <div className="modal-header" style={modalHeaderStyle}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-warning" size={24} />
            <h3>Better Alternative Available!</h3>
          </div>
          <button onClick={onClose} className="btn-close" style={closeButtonStyle}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={modalBodyStyle}>
          <div className="alert alert-warning mb-4">
            <p>
              <strong>The item you selected expires soon!</strong> We found a fresher alternative 
              with the same great quality and better shelf life.
            </p>
          </div>

          <div className="replacement-comparison" style={comparisonStyle}>
            {/* Original Item */}
            <div className="item-card" style={itemCardStyle}>
              <div className="item-header">
                <span className="badge badge-danger">Expires Soon</span>
              </div>
              <div className="item-icon" style={itemIconStyle}>
                {getProductIcon(replacement.original?.category)}
              </div>
              <h4>{replacement.original?.name || 'Original Item'}</h4>
              <div className="item-details">
                <div className="flex items-center gap-1 text-danger">
                  <Clock size={16} />
                  <span>Expires: {replacement.original?.expiry_date}</span>
                </div>
                <div className="price">
                  ${replacement.original?.discounted_price || replacement.original?.price_per_unit}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="arrow" style={arrowStyle}>
              →
            </div>

            {/* Replacement Item */}
            <div className="item-card recommended" style={{...itemCardStyle, ...recommendedStyle}}>
              <div className="item-header">
                <span className="badge badge-success">Recommended</span>
              </div>
              <div className="item-icon" style={itemIconStyle}>
                {getProductIcon(replacement.category)}
              </div>
              <h4>{replacement.name}</h4>
              <div className="item-details">
                <div className="flex items-center gap-1 text-success">
                  <Package2 size={16} />
                  <span>Expires: {replacement.expiry_date}</span>
                </div>
                <div className="price">
                  ${replacement.discounted_price || replacement.price_per_unit}
                  {replacement.discount > 0 && (
                    <span className="discount-badge ml-2">
                      {replacement.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="benefits" style={benefitsStyle}>
            <h5>Why this replacement is better:</h5>
            <ul>
              <li>✅ Longer shelf life - stays fresh longer</li>
              <li>✅ Same category and quality</li>
              <li>✅ Similar or better price</li>
              <li>✅ Reduces food waste</li>
              <li>✅ Earn loyalty points for sustainable choice</li>
            </ul>
          </div>
        </div>
        
        <div className="modal-actions" style={modalActionsStyle}>
          <button 
            onClick={onDecline} 
            className="btn btn-outline"
          >
            Keep Original
          </button>
          <button 
            onClick={() => onAccept(replacement)} 
            className="btn btn-success"
          >
            Accept Replacement (+5 loyalty points)
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline styles for the modal
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem'
};

const modalContentStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.5rem',
  borderBottom: '1px solid #e0e0e0'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '4px',
  color: '#666'
};

const modalBodyStyle = {
  padding: '1.5rem'
};

const comparisonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const itemCardStyle = {
  flex: 1,
  padding: '1rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  textAlign: 'center'
};

const recommendedStyle = {
  borderColor: '#00A652',
  backgroundColor: '#e6f7ed'
};

const itemIconStyle = {
  fontSize: '2rem',
  marginBottom: '0.5rem'
};

const arrowStyle = {
  fontSize: '2rem',
  color: '#0071CE',
  fontWeight: 'bold'
};

const benefitsStyle = {
  backgroundColor: '#f8f9fa',
  padding: '1rem',
  borderRadius: '8px'
};

const modalActionsStyle = {
  display: 'flex',
  gap: '1rem',
  padding: '1.5rem',
  borderTop: '1px solid #e0e0e0',
  justifyContent: 'flex-end'
};

export default ReplacementModal;
