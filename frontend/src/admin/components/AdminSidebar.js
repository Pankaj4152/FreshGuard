import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminPermission } from '../utils/permissions';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Tags,
  Brain,
  PieChart,
  Calendar,
  Leaf
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const hasDashboardPermission = useAdminPermission('dashboard.view');
  const hasInventoryPermission = useAdminPermission('inventory.view');
  const hasPricingPermission = useAdminPermission('pricing.view');
  const hasUsersPermission = useAdminPermission('users.view');
  const hasAIFeaturesPermission = useAdminPermission('ai-features.view');
  const hasReportsPermission = useAdminPermission('reports.view');
  const hasSettingsPermission = useAdminPermission('settings.view');

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      permission: hasDashboardPermission
    },
    {
      name: 'Inventory Management',
      icon: Package,
      path: '/admin/inventory',
      permission: hasInventoryPermission
    },
    {
      name: 'Pricing & Discounts',
      icon: Tags,
      path: '/admin/pricing',
      permission: hasPricingPermission
    },
    {
      name: 'Users & Orders',
      icon: Users,
      path: '/admin/users',
      permission: hasUsersPermission
    },
    {
      name: 'AI Features',
      icon: Brain,
      path: '/admin/ai-features',
      permission: hasAIFeaturesPermission
    },
    {
      name: 'Reports',
      icon: PieChart,
      path: '/admin/reports',
      permission: hasReportsPermission
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      permission: hasSettingsPermission
    }
  ].filter(item => item.permission);

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <Leaf size={24} />
          {!collapsed && <span>FreshGuard</span>}
        </div>
        <button 
          className="toggle-sidebar"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="admin-navigation">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li 
                key={item.path} 
                className={isActive(item.path) ? 'active' : ''}
              >
                <Link to={item.path}>
                  <Icon size={20} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        {!collapsed && (
          <div className="admin-version">
            <small>FreshGuard Admin v1.0</small>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
