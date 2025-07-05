import React from 'react';
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <X size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      default:
        return 'toast-info';
    }
  };

  return (
    <div className={`toast ${getTypeClass()}`} style={toastStyle}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">
        {message}
      </div>
      <button 
        className="toast-close"
        onClick={onClose}
        style={closeButtonStyle}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container" style={containerStyle}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration = 5000) => addToast(message, 'success', duration);
  const showError = (message, duration = 7000) => addToast(message, 'error', duration);
  const showWarning = (message, duration = 6000) => addToast(message, 'warning', duration);
  const showInfo = (message, duration = 5000) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
};

// Styles
const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px'
};

const toastStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '1px solid #e0e0e0',
  minWidth: '300px',
  animation: 'slideIn 0.3s ease-out'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// Add CSS for toast types and animations
const toastCSS = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast-success {
    border-left: 4px solid #00A652;
  }

  .toast-success .toast-icon {
    color: #00A652;
  }

  .toast-error {
    border-left: 4px solid #E53E3E;
  }

  .toast-error .toast-icon {
    color: #E53E3E;
  }

  .toast-warning {
    border-left: 4px solid #FF6600;
  }

  .toast-warning .toast-icon {
    color: #FF6600;
  }

  .toast-info {
    border-left: 4px solid #0071CE;
  }

  .toast-info .toast-icon {
    color: #0071CE;
  }

  .toast-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
  }

  .toast-close:hover {
    background-color: #f5f5f5;
  }

  @media (max-width: 480px) {
    .toast-container {
      left: 20px;
      right: 20px;
      max-width: none;
    }
    
    .toast {
      min-width: auto;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toastCSS;
  document.head.appendChild(style);
}

export default Toast;
