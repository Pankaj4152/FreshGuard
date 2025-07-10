import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Users, 
  Leaf, 
  Calendar, 
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import adminApiService from '../services/adminApiService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    sales: {
      today: 2450.75,
      week: 15780.50,
      month: 64320.25,
      growth: 12.5
    },
    inventory: {
      totalItems: 1248,
      lowStock: 42,
      expiringItems: 87
    },
    wasteReduction: {
      itemsSaved: 324,
      carbonSaved: 876.4,
      weightSaved: 1540.6
    },
    customers: {
      activeUsers: 875,
      cartAbandonment: 23.4,
      replacementRate: 68.7
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminApiService.getDashboardData();
        
        if (response.success) {
          setDashboardData(response.data);
        } else {
          console.error('Failed to fetch dashboard data:', response.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Sales data for chart - Use data from the state or fallback to defaults
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: dashboardData?.sales?.daily || [1823, 2150, 1975, 2100, 2540, 2780, 2450],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Category distribution data
  const categoryData = {
    labels: ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Pantry'],
    datasets: [
      {
        data: dashboardData?.inventory?.categories ? 
          Object.values(dashboardData.inventory.categories) : 
          [35, 25, 15, 10, 10, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Expiry tracking data
  const expiryData = {
    labels: ['Today', '1 Day', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days'],
    datasets: [
      {
        label: 'Expiring Items',
        data: dashboardData?.inventory?.expiry ? 
          Object.values(dashboardData.inventory.expiry) : 
          [12, 18, 22, 35, 45, 38, 25, 18],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
    const Icon = icon;
    const TrendIcon = trendValue >= 0 ? TrendingUp : TrendingDown;
    const trendColor = trendValue >= 0 ? 'success' : 'danger';
    
    return (
      <div className="admin-stat-card">
        <div className="stat-icon" style={{ backgroundColor: `var(--color-${color}-light)`, color: `var(--color-${color})` }}>
          <Icon size={24} />
        </div>
        <div className="stat-info">
          <h3>{title}</h3>
          <div className="stat-value">{value}</div>
          {trend && (
            <div className={`stat-trend trend-${trendColor}`}>
              <TrendIcon size={14} />
              <span>{Math.abs(trendValue)}% {trendValue >= 0 ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <div className="refresh-button">
          <button className="btn btn-outline">
            <RefreshCw size={16} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <StatCard
          title="Today's Sales"
          value={`$${dashboardData.sales.today.toLocaleString()}`}
          icon={DollarSign}
          trend={true}
          trendValue={dashboardData.sales.growth}
          color="primary"
        />
        <StatCard
          title="Total Inventory"
          value={dashboardData.inventory.totalItems.toLocaleString()}
          icon={Package}
          color="success"
        />
        <StatCard
          title="Expiring Items"
          value={dashboardData.inventory.expiringItems}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Active Customers"
          value={dashboardData.customers.activeUsers}
          icon={Users}
          color="info"
        />
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-container sales-chart">
          <div className="chart-header">
            <h2>Weekly Sales Overview</h2>
            <div className="chart-actions">
              <select className="chart-select">
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
              </select>
            </div>
          </div>
          <div className="chart-body">
            <Bar 
              data={salesData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="admin-chart-container category-chart">
          <div className="chart-header">
            <h2>Sales by Category</h2>
          </div>
          <div className="chart-body">
            <Doughnut 
              data={categoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-container expiry-chart">
          <div className="chart-header">
            <h2>Expiry Tracking</h2>
          </div>
          <div className="chart-body">
            <Line 
              data={expiryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="admin-impact-metrics">
          <h2>Environmental Impact</h2>
          <div className="impact-stats">
            <div className="impact-stat">
              <div className="impact-icon">
                <Package size={24} />
              </div>
              <div className="impact-info">
                <h3>Items Rescued</h3>
                <div className="impact-value">{dashboardData.wasteReduction.itemsSaved}</div>
              </div>
            </div>
            
            <div className="impact-stat">
              <div className="impact-icon">
                <Leaf size={24} />
              </div>
              <div className="impact-info">
                <h3>CO2 Saved</h3>
                <div className="impact-value">{dashboardData.wasteReduction.carbonSaved} kg</div>
              </div>
            </div>
            
            <div className="impact-stat">
              <div className="impact-icon">
                <DollarSign size={24} />
              </div>
              <div className="impact-info">
                <h3>Discount Impact</h3>
                <div className="impact-value">+12.4% sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-action-buttons">
          <button className="btn btn-primary">
            <Package size={16} />
            <span>Add Inventory</span>
          </button>
          <button className="btn btn-success">
            <AlertTriangle size={16} />
            <span>Review Expiry Alerts</span>
          </button>
          <button className="btn btn-warning">
            <Calendar size={16} />
            <span>Schedule Discounts</span>
          </button>
          <button className="btn btn-info">
            <BarChart3 size={16} />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
