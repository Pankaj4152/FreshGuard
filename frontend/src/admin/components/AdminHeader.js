import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LogOut, Bell, Settings, User } from 'lucide-react';

const AdminHeader = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h2>FreshGuard Admin</h2>
      </div>
      <div className="admin-header-right">
        <div className="admin-notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </div>
        <div className="admin-settings">
          <Settings size={20} />
        </div>
        <div className="admin-profile">
          <div className="admin-info">
            <span className="admin-name">{admin?.name || 'Admin'}</span>
            <span className="admin-store">{admin?.storeName || 'Store Admin'}</span>
          </div>
          <div className="admin-avatar">
            <User size={20} />
          </div>
          <div className="admin-dropdown">
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
