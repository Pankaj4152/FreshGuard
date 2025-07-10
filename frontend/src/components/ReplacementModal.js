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
          {/* Smart messaging */}
          {replacement.warning && (
            <div className="alert alert-warning mb-3">
              <AlertTriangle size={16} className="mr-2" />
              <strong>{replacement.warning}</strong>
            </div>
          )}
          
          {replacement.incentive && (
            <div className="alert alert-success mb-4">
              <Package2 size={16} className="mr-2" />
              <strong>
                {typeof replacement.incentive === 'string' 
                  ? replacement.incentive 
                  : replacement.incentive.discount || replacement.incentive.extra_points
                    ? `Save ${Math.round((replacement.incentive.discount || 0) * 100)}% + earn ${replacement.incentive.extra_points || 0} bonus points!`
                    : 'Special incentive available!'
                }
              </strong>
            </div>
          )}
          
          {!replacement.warning && !replacement.incentive && (
            <div className="alert alert-warning mb-4">
              <p>
                <strong>Better alternative available!</strong> Save money and help reduce food waste 
                with a discounted item that's still fresh but needs to be used soon.
              </p>
            </div>
          )}

          <div className="replacement-comparison" style={comparisonStyle}>
            {/* Original Item */}
            <div className="item-card" style={itemCardStyle}>
              <div className="item-header">
                <span className="badge badge-primary">Fresh Choice</span>
              </div>
              <div className="item-icon" style={itemIconStyle}>
                {getProductIcon(replacement.original?.category)}
              </div>
              <h4>{replacement.original?.item_name || replacement.original?.name || 'Fresh Item'}</h4>
              <div className="item-details">
                <div className="flex items-center gap-1 text-primary">
                  <Clock size={16} />
                  <span>Expires: {replacement.original?.expiry_date}</span>
                </div>
                <div className="price">
                  ${(replacement.original?.discounted_price || replacement.original?.price_per_unit || 0).toFixed(2)}
                </div>
                <small className="text-muted">Regular choice - longer shelf life</small>
              </div>
            </div>

            {/* Arrow */}
            <div className="arrow" style={arrowStyle}>
              or
            </div>

            {/* Replacement Item */}
            <div className="item-card recommended" style={{...itemCardStyle, ...recommendedStyle}}>
              <div className="item-header">
                <span className="badge badge-success">Save & Help!</span>
                <span className="urgency-badge">
                  {replacement.urgency_level === 'critical' ? '⚡ Urgent' : '⏰ Soon'}
                </span>
              </div>
              <div className="item-icon" style={itemIconStyle}>
                {getProductIcon(replacement.category)}
              </div>
              <h4>{replacement.item_name || replacement.name}</h4>
              <div className="item-details">
                <div className="flex items-center gap-1 text-warning">
                  <AlertTriangle size={16} />
                  <span>Expires: {replacement.expiry_date}</span>
                  <small>({replacement.days_until_expiry} days left)</small>
                </div>
                <div className="price">
                  ${(replacement.discounted_price || replacement.price_per_unit || 0).toFixed(2)}
                  {(replacement.effective_discount || replacement.discount || 0) > 0 && (
                    <span className="discount-badge ml-2">
                      {replacement.effective_discount || replacement.discount}% OFF
                    </span>
                  )}
                </div>
                <small className="replacement-message">
                  {replacement.suggested_message || "Buy only if you can use it quickly"}
                </small>
              </div>
            </div>
          </div>

          <div className="benefits" style={benefitsStyle}>
            <h5>Choose the near-expiry option to:</h5>
            <ul>
              <li>💰 Save money with discount pricing</li>
              <li>🏆 Earn 10 loyalty points (vs 1 for regular items)</li>
              <li>🌱 Help reduce food waste</li>
              <li>⚡ Get the same quality, just use it soon</li>
              <li>📱 Track your environmental impact</li>
            </ul>
          </div>
        </div>
        
        <div className="modal-actions" style={modalActionsStyle}>
          <button 
            onClick={onDecline} 
            className="btn btn-outline"
          >
            Keep Fresh Item
          </button>
          <button 
            onClick={() => onAccept(replacement)} 
            className="btn btn-success"
          >
            Accept Discounted Item (+10 loyalty points)
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
