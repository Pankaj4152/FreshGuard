import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminPermission } from '../utils/permissions';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const ProtectedAdminRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check permissions based on current path
  const currentPath = location.pathname;
  let requiredPermission = '';
  
  if (currentPath.includes('/admin/dashboard')) {
    requiredPermission = 'dashboard.view';
  } else if (currentPath.includes('/admin/inventory')) {
    requiredPermission = 'inventory.view';
  } else if (currentPath.includes('/admin/pricing')) {
    requiredPermission = 'pricing.view';
  } else if (currentPath.includes('/admin/users')) {
    requiredPermission = 'users.view';
  } else if (currentPath.includes('/admin/ai-features')) {
    requiredPermission = 'ai-features.view';
  } else if (currentPath.includes('/admin/reports')) {
    requiredPermission = 'reports.view';
  } else if (currentPath.includes('/admin/settings')) {
    requiredPermission = 'settings.view';
  }
  
  // If permission is required and user doesn't have it, show access denied
  const hasPermission = useAdminPermission(requiredPermission);
  
  console.log('Current path:', currentPath);
  console.log('Required permission:', requiredPermission);
  console.log('Has permission:', hasPermission);
  
  // For development purposes, always allow access to authenticated users
  // Set to true to enable permission checks
  const enablePermissionChecks = false;
  if (enablePermissionChecks && requiredPermission && !hasPermission) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <AdminHeader />
          <div className="admin-main">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have permission to access this page.</p>
              <p>Required permission: {requiredPermission}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedAdminRoute;
