import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      name: 'Inventory Management',
      icon: Package,
      path: '/admin/inventory'
    },
    {
      name: 'Pricing & Discounts',
      icon: Tags,
      path: '/admin/pricing'
    },
    {
      name: 'Users & Orders',
      icon: Users,
      path: '/admin/users'
    },
    {
      name: 'AI Features',
      icon: Brain,
      path: '/admin/ai-features'
    },
    {
      name: 'Reports',
      icon: PieChart,
      path: '/admin/reports'
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

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
