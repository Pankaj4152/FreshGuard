import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import { useToast } from '../components/Toast';
import { 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  Award, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Users,
  Globe,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user, userImpact } = useUser(); // Remove refreshUserData dependency  
  const { showError, ToastContainer } = useToast();
  
  // Debug log
  console.log('Dashboard component - user:', user);
  console.log('Dashboard component - userImpact:', userImpact);
  
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({
    foodSaved: 0,
    moneySaved: 0,
    loyaltyPoints: 0,
    ordersCompleted: 0,
    co2Reduced: 0,
    rank: 'Bronze'
  });
  const [chartData, setChartData] = useState({
    monthlyFoodSaved: [],
    categoryBreakdown: [],
    savingsOverTime: []
  });

  useEffect(() => {
    // Always load dashboard data on mount
    loadDashboardData();
  }, []);

  // Update dashboard when userImpact changes from UserContext
  useEffect(() => {
    if (userImpact && Object.keys(userImpact).length > 0) {
      console.log('Updating dashboard from userImpact:', userImpact);
      setImpactData(prev => ({
        ...prev,
        foodSaved: userImpact.food_saved_kg || prev.foodSaved || 0,
        moneySaved: userImpact.money_saved || prev.moneySaved || 0,
        loyaltyPoints: userImpact.loyalty_points || user?.loyaltyPoints || prev.loyaltyPoints || 0,
        co2Reduced: userImpact.co2_saved_kg || prev.co2Reduced || 0,
        ordersCompleted: Math.floor((userImpact.items_saved || 0) / 3) || prev.ordersCompleted || 0,
        rank: getRankFromPoints(userImpact.loyalty_points || user?.loyaltyPoints || prev.loyaltyPoints || 0)
      }));
    }
  }, [userImpact, user]);

  // Also update when user data changes
  useEffect(() => {
    if (user?.loyaltyPoints !== undefined) {
      setImpactData(prev => ({
        ...prev,
        loyaltyPoints: user.loyaltyPoints,
        rank: getRankFromPoints(user.loyaltyPoints)
      }));
    }
  }, [user?.loyaltyPoints]);

  const loadDashboardData = async () => {
    console.log('🔄 Starting dashboard data load...');
    setLoading(true);
    
    try {
      // Test enhanced API features  
      const userId = user?.id || 'user1';
      console.log('📊 Loading dashboard data for user:', userId);
      
      // Load data with individual error handling
      let impactResponse = null;
      let loyaltyResponse = null;
      
      try {
        console.log('🎯 Calling getUserImpact...');
        impactResponse = await apiService.getUserImpact(userId);
        console.log('✅ Impact API Response:', impactResponse);
      } catch (err) {
        console.error('❌ Impact API error:', err);
        impactResponse = { success: false, error: err.message };
      }
      
      try {
        console.log('🏆 Calling getLoyaltyPoints...');  
        loyaltyResponse = await apiService.getLoyaltyPoints(userId);
        console.log('✅ Loyalty API Response:', loyaltyResponse);
      } catch (err) {
        console.error('❌ Loyalty API error:', err);
        loyaltyResponse = { success: false, error: err.message };
      }
      
      // Process impact data with better fallbacks
      let impactToUse = {};
      if (impactResponse && impactResponse.success && impactResponse.impact) {
        impactToUse = impactResponse.impact;
        console.log('📈 Using API impact data:', impactToUse);
      } else if (userImpact && Object.keys(userImpact).length > 0) {
        impactToUse = userImpact;
        console.log('📋 Using context impact data:', impactToUse);
      } else {
        // Fallback to default values
        impactToUse = {
          food_saved_kg: 12.5,
          money_saved: 47.25,
          loyalty_points: 185,
          items_saved: 24,
          co2_saved_kg: 23.4,
          total_orders: 8
        };
        console.log('🔄 Using fallback impact data:', impactToUse);
      }
      
      // Process loyalty data with better fallbacks
      let loyaltyPoints = 0;
      if (loyaltyResponse && loyaltyResponse.success) {
        loyaltyPoints = loyaltyResponse.points || loyaltyResponse.loyalty_points || 0;
        console.log('🏆 Using API loyalty points:', loyaltyPoints);
      } else if (user?.loyaltyPoints !== undefined) {
        loyaltyPoints = user.loyaltyPoints;
        console.log('👤 Using context loyalty points:', loyaltyPoints);
      } else {
        loyaltyPoints = impactToUse.loyalty_points || 185;
        console.log('🔄 Using fallback loyalty points:', loyaltyPoints);
      }
      
      // Set the impact data
      const newImpactData = {
        foodSaved: Number(impactToUse.food_saved_kg) || 0,
        moneySaved: Number(impactToUse.money_saved) || 0, 
        loyaltyPoints: Number(loyaltyPoints) || 0,
        co2Reduced: Number(impactToUse.co2_saved_kg) || 0,
        ordersCompleted: Number(impactToUse.total_orders) || Math.floor((Number(impactToUse.items_saved) || 0) / 3) || 0,
        rank: getRankFromPoints(Number(loyaltyPoints) || 0)
      };
      
      console.log('🎯 Setting dashboard impact data:', newImpactData);
      
      setImpactData(prev => ({
        ...prev,
        ...newImpactData
      }));
      
      // Generate mock chart data for demo
      generateMockChartData();
      
      console.log('✅ Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      console.error('📋 Error details:', {
        message: error.message,
        stack: error.stack,
        userImpact: userImpact,
        user: user
      });
      
      // Show error but don't fail completely - use fallback data
      showError(`Dashboard data issue: ${error.message}`);
      
      // Use comprehensive fallback data so dashboard still shows something useful
      const fallbackImpact = {
        food_saved_kg: 12.5,
        money_saved: 47.25,
        loyalty_points: 185,
        items_saved: 24,
        co2_saved_kg: 23.4,
        total_orders: 8
      };
      
      setImpactData(prev => ({
        ...prev,
        foodSaved: Number(fallbackImpact.food_saved_kg),
        moneySaved: Number(fallbackImpact.money_saved), 
        loyaltyPoints: Number(fallbackImpact.loyalty_points),
        ordersCompleted: Number(fallbackImpact.total_orders),
        co2Reduced: Number(fallbackImpact.co2_saved_kg),
        rank: getRankFromPoints(Number(fallbackImpact.loyalty_points))
      }));
      
      // Generate mock chart data for demo
      generateMockChartData();
      
    } finally {
      setLoading(false);
      console.log('🏁 Dashboard loading complete');
    }
  };

  const generateMockChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyData = months.map(month => ({
      month,
      foodSaved: Math.floor(Math.random() * 5) + 1,
      moneySaved: Math.floor(Math.random() * 20) + 5
    }));
    
    const categoryData = [
      { category: 'Dairy', amount: 4.2, percentage: 34 },
      { category: 'Produce', amount: 3.8, percentage: 30 },
      { category: 'Bakery', amount: 2.5, percentage: 20 },
      { category: 'Meat', amount: 2.0, percentage: 16 }
    ];
    
    setChartData({
      monthlyFoodSaved: monthlyData,
      categoryBreakdown: categoryData,
      savingsOverTime: monthlyData
    });
  };

  const getRankColor = (rank) => {
    switch (rank.toLowerCase()) {
      case 'bronze': return 'var(--walmart-orange)';
      case 'silver': return '#C0C0C0';
      case 'gold': return 'var(--walmart-yellow)';
      case 'platinum': return '#E5E4E2';
      default: return 'var(--walmart-blue)';
    }
  };

  const getRankFromPoints = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    if (points >= 100) return 'Bronze';
    return 'Member';
  };

  const formatCO2 = (kg) => {
    return `${kg.toFixed(1)} kg CO₂`;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="spinner spinner-primary mb-4"></div>
          <p>Loading your impact dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ToastContainer />
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1 className="page-title">
            <BarChart3 className="mr-3" size={32} />
            Impact Dashboard
          </h1>
          <p className="page-description">
            Track your food waste reduction and environmental impact
          </p>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={loadDashboardData} 
            disabled={loading}
            className="btn btn-outline-primary"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
          <div className="user-rank">
            <div className="rank-badge" style={{ backgroundColor: getRankColor(impactData.rank) }}>
              <Award size={24} />
              <span>{impactData.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card highlight">
          <div className="metric-icon">
            <Leaf />
          </div>
          <div className="metric-content">
            <h3>{impactData.foodSaved.toFixed(1)} kg</h3>
            <p>Food Saved</p>
            <div className="metric-trend">
              <TrendingUp size={16} />
              <span>+2.3kg this month</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign />
          </div>
          <div className="metric-content">
            <h3>${(impactData.moneySaved || 0).toFixed(2)}</h3>
            <p>Money Saved</p>
            <div className="metric-trend">
              <TrendingUp size={16} />
              <span>+$12.50 this month</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Globe />
          </div>
          <div className="metric-content">
            <h3>{formatCO2(impactData.co2Reduced)}</h3>
            <p>CO₂ Reduced</p>
            <div className="metric-trend">
              <TrendingUp size={16} />
              <span>+5.2kg this month</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Sparkles />
          </div>
          <div className="metric-content">
            <h3>{impactData.loyaltyPoints}</h3>
            <p>Loyalty Points</p>
            <div className="metric-trend">
              <TrendingUp size={16} />
              <span>+35 this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="card">
            <div className="card-header">
              <h3>Monthly Food Saved</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: 'var(--walmart-green)' }}></div>
                  Food Saved (kg)
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-placeholder">
                <div className="bar-chart">
                  {chartData.monthlyFoodSaved.map((data, index) => (
                    <div key={data.month} className="bar-item">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${(data.foodSaved / 5) * 100}%`,
                          backgroundColor: 'var(--walmart-green)'
                        }}
                      ></div>
                      <span className="bar-label">{data.month}</span>
                      <span className="bar-value">{data.foodSaved}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="card">
            <div className="card-header">
              <h3>Food Saved by Category</h3>
            </div>
            <div className="card-body">
              <div className="category-breakdown">
                {chartData.categoryBreakdown.map((category, index) => (
                  <div key={category.category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.category}</span>
                      <span className="category-amount">{category.amount}kg</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress" 
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: `hsl(${index * 90}, 70%, 50%)`
                        }}
                      ></div>
                    </div>
                    <span className="category-percentage">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="stats-section">
        <div className="card">
          <div className="card-header">
            <h3>Your Impact Summary</h3>
          </div>
          <div className="card-body">
            <div className="impact-stats">
              <div className="impact-stat">
                <div className="stat-icon">
                  <Target />
                </div>
                <div className="stat-content">
                  <h4>{impactData.ordersCompleted}</h4>
                  <p>Orders Completed</p>
                </div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-icon">
                  <Calendar />
                </div>
                <div className="stat-content">
                  <h4>6</h4>
                  <p>Months Active</p>
                </div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-icon">
                  <Users />
                </div>
                <div className="stat-content">
                  <h4>Top 15%</h4>
                  <p>Among Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Environmental Impact</h3>
          </div>
          <div className="card-body">
            <div className="environmental-metrics">
              <div className="env-metric">
                <div className="env-icon">
                  <Globe />
                </div>
                <div className="env-content">
                  <h4>Equivalent to</h4>
                  <p>Planting 2.3 trees</p>
                </div>
              </div>
              
              <div className="env-metric">
                <div className="env-icon">
                  <Activity />
                </div>
                <div className="env-content">
                  <h4>Water saved</h4>
                  <p>156 liters</p>
                </div>
              </div>
              
              <div className="env-metric">
                <div className="env-icon">
                  <Leaf />
                </div>
                <div className="env-content">
                  <h4>Land saved</h4>
                  <p>0.8 m²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <div className="card">
          <div className="card-header">
            <h3>Recent Achievements</h3>
          </div>
          <div className="card-body">
            <div className="achievements-grid">
              <div className="achievement-badge earned">
                <Award size={24} />
                <span>First Order</span>
              </div>
              <div className="achievement-badge earned">
                <Leaf size={24} />
                <span>10kg Saved</span>
              </div>
              <div className="achievement-badge earned">
                <DollarSign size={24} />
                <span>$25 Saved</span>
              </div>
              <div className="achievement-badge">
                <Target size={24} />
                <span>50kg Goal</span>
              </div>
              <div className="achievement-badge">
                <Sparkles size={24} />
                <span>500 Points</span>
              </div>
              <div className="achievement-badge">
                <Users size={24} />
                <span>Top 10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
