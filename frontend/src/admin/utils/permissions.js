import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * Custom hook to check if the current admin user has a specific permission
 * @param {string} permission - The permission to check
 * @returns {boolean} Whether the user has the permission
 */
export const useAdminPermission = (permission) => {
  const { admin } = useAdminAuth();
  
  if (!admin || !admin.permissions) {
    return false;
  }
  
  return admin.permissions.includes(permission);
};

/**
 * Component to conditionally render content based on admin permissions
 */
export const AdminPermission = ({ permission, children, fallback = null }) => {
  const hasPermission = useAdminPermission(permission);
  
  if (hasPermission) {
    return children;
  }
  
  return fallback;
};

/**
 * Get all available permissions
 * Useful for rendering permission selection UI
 */
export const getAvailablePermissions = () => {
  return [
    { id: 'dashboard.view', name: 'View Dashboard', category: 'Dashboard' },
    { id: 'inventory.view', name: 'View Inventory', category: 'Inventory' },
    { id: 'inventory.edit', name: 'Edit Inventory', category: 'Inventory' },
    { id: 'pricing.view', name: 'View Pricing', category: 'Pricing' },
    { id: 'pricing.edit', name: 'Edit Pricing', category: 'Pricing' },
    { id: 'users.view', name: 'View Users', category: 'Users' },
    { id: 'users.edit', name: 'Edit Users', category: 'Users' },
    { id: 'ai-features.view', name: 'View AI Features', category: 'AI' },
    { id: 'ai-features.edit', name: 'Edit AI Features', category: 'AI' },
    { id: 'reports.view', name: 'View Reports', category: 'Reports' },
    { id: 'settings.view', name: 'View Settings', category: 'Settings' },
    { id: 'settings.edit', name: 'Edit Settings', category: 'Settings' }
  ];
};
