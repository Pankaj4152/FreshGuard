import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';
import { useToast } from '../components/Toast';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Bell,
  BellOff,
  Trash2,
  RefreshCw,
  Package,
  Zap
} from 'lucide-react';

const Alerts = () => {
  const { user } = useUser();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  const [alerts, setAlerts] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, warning
  const [alertSettings, setAlertSettings] = useState({
    enabled: true,
    criticalDays: 1,
    warningDays: 3
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      const [alertsResponse, inventoryResponse] = await Promise.all([
        apiService.getAlerts(user?.id || 'user1', 3),
        apiService.getExpiringItems(3)
      ]);
      
      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts || []);
      }
      
      if (inventoryResponse.success) {
        setExpiringItems(inventoryResponse.inventory || []);
      }
      
    } catch (error) {
      console.error('Error loading alerts:', error);
      showError('Failed to load alerts');
      
      // Mock data for demo
      setAlerts([
        {
          id: 1,
          type: 'expiry',
          severity: 'critical',
          title: 'Items Expiring Soon',
          message: 'You have 2 items in your cart that expire within 1 day',
          timestamp: new Date().toISOString(),
          items: ['Milk', 'Yogurt']
        },
        {
          id: 2,
          type: 'discount',
          severity: 'info',
          title: 'New Discounts Available',
          message: '25% off on fresh produce - limited time offer!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]);
      
      setExpiringItems([
        {
          item_id: 'ITEM1001',
          name: 'Organic Milk',
          category: 'Dairy',
          price_per_unit: 3.49,
          discounted_price: 2.49,
          current_stock: 8,
          expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          effective_discount: 29
        },
        {
          item_id: 'ITEM1002',
          name: 'Greek Yogurt',
          category: 'Dairy',
          price_per_unit: 4.99,
          discounted_price: 3.49,
          current_stock: 12,
          expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          effective_discount: 30
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type, severity) => {
    if (severity === 'critical') return <AlertTriangle className="text-danger" />;
    if (type === 'expiry') return <Clock className="text-warning" />;
    if (type === 'discount') return <Zap className="text-primary" />;
    return <Bell className="text-info" />;
  };

  const getAlertClass = (severity) => {
    switch (severity) {
      case 'critical': return 'alert-critical';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!apiService.getDaysUntilExpiry) {
      return { status: 'unknown', text: 'Unknown', color: 'secondary' };
    }
    
    const days = apiService.getDaysUntilExpiry(expiryDate);
    
    if (days <= 0) return { status: 'critical', text: 'Expired', color: 'danger' };
    if (days === 1) return { status: 'critical', text: 'Expires Tomorrow', color: 'danger' };
    if (days <= 2) return { status: 'warning', text: `${days} days left`, color: 'warning' };
    return { status: 'caution', text: `${days} days left`, color: 'info' };
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    showSuccess('Alert dismissed');
  };

  const toggleAlerts = () => {
    setAlertSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    showSuccess(`Alerts ${alertSettings.enabled ? 'disabled' : 'enabled'}`);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const filteredExpiringItems = expiringItems.filter(item => {
    const status = getExpiryStatus(item.expiry_date);
    if (filter === 'all') return true;
    if (filter === 'critical') return status.status === 'critical';
    if (filter === 'warning') return status.status === 'warning';
    return true;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="spinner spinner-primary mb-4"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ToastContainer />
      
      {/* Header */}
      <div className="alerts-header">
        <div className="alerts-title">
          <h1 className="page-title">
            <Bell className="mr-3" size={32} />
            Alerts & Notifications
          </h1>
          <p className="page-description">
            Stay informed about expiring items and special offers
          </p>
        </div>
        
        <div className="alerts-actions">
          <button 
            onClick={toggleAlerts}
            className={`btn ${alertSettings.enabled ? 'btn-outline-danger' : 'btn-outline-success'}`}
          >
            {alertSettings.enabled ? <BellOff size={18} /> : <Bell size={18} />}
            <span className="ml-2">
              {alertSettings.enabled ? 'Disable Alerts' : 'Enable Alerts'}
            </span>
          </button>
          
          <button 
            onClick={loadAlerts}
            className="btn btn-outline-primary"
            disabled={loading}
          >
            <RefreshCw size={18} />
            <span className="ml-2">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          onClick={() => setFilter('all')}
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
        >
          All Alerts
          <span className="badge">{alerts.length + expiringItems.length}</span>
        </button>
        <button 
          onClick={() => setFilter('critical')}
          className={`filter-tab ${filter === 'critical' ? 'active' : ''}`}
        >
          Critical
          <span className="badge badge-danger">
            {alerts.filter(a => a.severity === 'critical').length + 
             expiringItems.filter(i => getExpiryStatus(i.expiry_date).status === 'critical').length}
          </span>
        </button>
        <button 
          onClick={() => setFilter('warning')}
          className={`filter-tab ${filter === 'warning' ? 'active' : ''}`}
        >
          Warning
          <span className="badge badge-warning">
            {alerts.filter(a => a.severity === 'warning').length + 
             expiringItems.filter(i => getExpiryStatus(i.expiry_date).status === 'warning').length}
          </span>
        </button>
      </div>

      {/* Active Alerts */}
      {filteredAlerts.length > 0 && (
        <div className="alerts-section">
          <h2 className="section-title">
            <AlertTriangle className="mr-2" size={24} />
            Active Alerts
          </h2>
          
          <div className="alerts-list">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${getAlertClass(alert.severity)}`}>
                <div className="alert-icon">
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <div className="alert-meta">
                    <Calendar size={14} />
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  {alert.items && alert.items.length > 0 && (
                    <div className="alert-items">
                      <strong>Items: </strong>
                      {alert.items.join(', ')}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="alert-dismiss"
                  title="Dismiss alert"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Items */}
      {filteredExpiringItems.length > 0 && (
        <div className="expiring-items-section">
          <h2 className="section-title">
            <Clock className="mr-2" size={24} />
            Items Expiring Soon
          </h2>
          
          <div className="expiring-items-grid">
            {filteredExpiringItems.map(item => {
              const expiryStatus = getExpiryStatus(item.expiry_date);
              
              return (
                <div key={item.item_id} className="expiring-item-card">
                  <div className={`expiry-badge ${expiryStatus.color}`}>
                    {expiryStatus.text}
                  </div>
                  <ProductCard 
                    product={item}
                    showAddToCart={true}
                    compact={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAlerts.length === 0 && filteredExpiringItems.length === 0 && (
        <div className="empty-alerts">
          <div className="empty-icon">
            {alertSettings.enabled ? <Bell size={64} /> : <BellOff size={64} />}
          </div>
          <h2>
            {alertSettings.enabled ? 'No alerts at the moment' : 'Alerts are disabled'}
          </h2>
          <p>
            {alertSettings.enabled 
              ? 'Check back later for updates on expiring items and special offers.'
              : 'Enable alerts to stay informed about expiring items and discounts.'
            }
          </p>
          <div className="empty-actions">
            {alertSettings.enabled ? (
              <Link to="/inventory" className="btn btn-primary">
                <Package className="mr-2" size={20} />
                Browse Inventory
              </Link>
            ) : (
              <button onClick={toggleAlerts} className="btn btn-primary">
                <Bell className="mr-2" size={20} />
                Enable Alerts
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alert Settings */}
      <div className="alert-settings">
        <div className="card">
          <div className="card-header">
            <h3>Alert Settings</h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={alertSettings.enabled}
                  onChange={toggleAlerts}
                />
                Enable push notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                Alert for items expiring within:
                <select 
                  value={alertSettings.warningDays}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    warningDays: parseInt(e.target.value)
                  }))}
                >
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
