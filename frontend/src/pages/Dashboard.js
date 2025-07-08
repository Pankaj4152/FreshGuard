import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
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
  RefreshCw,
  Share2,
  Trophy,
  Check,
  Zap
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user, userImpact } = useUser(); // Remove refreshUserData dependency  
  const { showError, ToastContainer } = useToast();
  
  // Debug log
  console.log('Dashboard component - user:', user);
  console.log('Dashboard component - userImpact:', userImpact);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [animatedValues, setAnimatedValues] = useState({
    foodSaved: 0,
    moneySaved: 0,
    co2Reduced: 0,
    loyaltyPoints: 0
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [milestone, setMilestone] = useState(null);
  
  const chartRefs = {
    foodSavedRef: useRef(null),
    categoriesRef: useRef(null),
    savingsRef: useRef(null),
    radarRef: useRef(null)
  };
  
  const [impactData, setImpactData] = useState({
    foodSaved: 0,
    moneySaved: 0,
    loyaltyPoints: 0,
    ordersCompleted: 0,
    co2Reduced: 0,
    rank: 'Bronze',
    waterSaved: 0,
    landSaved: 0,
    percentileRank: 50
  });
  const [chartData, setChartData] = useState({
    monthlyFoodSaved: [],
    categoryBreakdown: [],
    savingsOverTime: [],
    impactRadar: {}
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
    setAnimatedValues({
      foodSaved: 0,
      moneySaved: 0,
      co2Reduced: 0,
      loyaltyPoints: 0
    });
    
    try {
      // Test enhanced API features  
      const userId = user?.id || 'user1';
      console.log('📊 Loading dashboard data for user:', userId);
      
      // Load data with individual error handling
      let impactResponse = null;
      let loyaltyResponse = null;
      let environmentalResponse = null;
      
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
      
      try {
        // Try to get additional environmental impact data
        environmentalResponse = await apiService.request('/environmental_impact');
        console.log('🌱 Environmental impact data:', environmentalResponse);
      } catch (err) {
        console.error('❌ Environmental data error:', err);
        environmentalResponse = null;
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
      
      // Extract or calculate environmental impact metrics
      let waterSaved = 0;
      let landSaved = 0;
      
      if (environmentalResponse && environmentalResponse.items) {
        // Calculate average water and land saved based on food categories
        const relevantItems = Object.values(environmentalResponse.items).slice(0, 5);
        waterSaved = relevantItems.reduce((sum, item) => sum + item.water_saved_liters, 0) / relevantItems.length * impactToUse.food_saved_kg;
        landSaved = relevantItems.reduce((sum, item) => sum + item.land_saved_m2, 0) / relevantItems.length * impactToUse.food_saved_kg;
      } else {
        // Fallback estimations based on food saved
        waterSaved = impactToUse.food_saved_kg * 100; // 100L per kg as estimate
        landSaved = impactToUse.food_saved_kg * 0.4;  // 0.4m² per kg as estimate
      }
      
      // Calculate user percentile (would come from backend in real app)
      const percentileRank = Math.min(95, Math.floor((loyaltyPoints / 200) * 100));
      
      // Set the impact data
      const newImpactData = {
        foodSaved: Number(impactToUse.food_saved_kg) || 0,
        moneySaved: Number(impactToUse.money_saved) || 0, 
        loyaltyPoints: Number(loyaltyPoints) || 0,
        co2Reduced: Number(impactToUse.co2_saved_kg) || 0,
        ordersCompleted: Number(impactToUse.total_orders) || Math.floor((Number(impactToUse.items_saved) || 0) / 3) || 0,
        rank: getRankFromPoints(Number(loyaltyPoints) || 0),
        waterSaved: Math.round(waterSaved),
        landSaved: landSaved.toFixed(1),
        percentileRank
      };
      
      console.log('🎯 Setting dashboard impact data:', newImpactData);
      
      // Check for milestones to trigger celebrations
      checkForMilestones(newImpactData);
      
      setImpactData(newImpactData);
      
      // Animate the counters up from zero
      setTimeout(() => {
        setAnimatedValues({
          foodSaved: newImpactData.foodSaved,
          moneySaved: newImpactData.moneySaved,
          co2Reduced: newImpactData.co2Reduced,
          loyaltyPoints: newImpactData.loyaltyPoints
        });
      }, 200);
      
      // Generate chart data based on impact data
      generateChartData(newImpactData);
      
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

  const generateChartData = (impact) => {
    // Generate realistic monthly data with upward trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = Math.max(impact.foodSaved / 6, 0.5);
    
    // Create monthly progression with slight variance for realism
    const monthlyData = months.map((month, index) => {
      const growthFactor = 1 + (index * 0.15); // Progressive growth
      const variance = Math.random() * 0.3 - 0.15; // +/- 15% random variation
      return {
        month,
        foodSaved: Number((baseValue * growthFactor * (1 + variance)).toFixed(1)),
        moneySaved: Number((baseValue * 3.5 * growthFactor * (1 + variance)).toFixed(2))
      };
    });
    
    // Generate category breakdown based on backend data or realistic estimates
    const categoryData = [
      { category: 'Dairy', amount: impact.foodSaved * 0.34, percentage: 34, color: 'rgba(54, 162, 235, 0.8)' },
      { category: 'Produce', amount: impact.foodSaved * 0.30, percentage: 30, color: 'rgba(75, 192, 192, 0.8)' },
      { category: 'Bakery', amount: impact.foodSaved * 0.20, percentage: 20, color: 'rgba(255, 206, 86, 0.8)' },
      { category: 'Meat', amount: impact.foodSaved * 0.16, percentage: 16, color: 'rgba(255, 99, 132, 0.8)' }
    ];
    
    // Generate radar chart data for environmental impact
    const radarData = {
      labels: ['Food Waste Reduced', 'CO₂ Saved', 'Water Saved', 'Money Saved', 'Land Preserved'],
      datasets: [
        {
          label: 'Your Impact',
          data: [
            // Normalize all values to 0-100 scale for radar chart
            Math.min(impact.foodSaved * 8, 100),
            Math.min(impact.co2Reduced * 4, 100),
            Math.min(impact.waterSaved * 0.5, 100),
            Math.min(impact.moneySaved * 2, 100),
            Math.min(impact.landSaved * 100, 100)
          ],
          backgroundColor: 'rgba(4, 120, 87, 0.2)',
          borderColor: 'rgba(4, 120, 87, 1)',
          pointBackgroundColor: 'rgba(4, 120, 87, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(4, 120, 87, 1)',
          borderWidth: 2
        },
        {
          label: 'Average User',
          data: [40, 35, 30, 45, 25],
          backgroundColor: 'rgba(128, 128, 128, 0.1)',
          borderColor: 'rgba(128, 128, 128, 0.8)',
          pointBackgroundColor: 'rgba(128, 128, 128, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(128, 128, 128, 1)',
          borderWidth: 2
        }
      ]
    };
    
    setChartData({
      monthlyFoodSaved: monthlyData,
      categoryBreakdown: categoryData,
      savingsOverTime: monthlyData,
      impactRadar: radarData
    });
  };

  const checkForMilestones = (impact) => {
    // Define milestone thresholds
    const milestones = [
      { id: 'food5kg', type: 'food', threshold: 5, text: 'You saved 5kg of food!', icon: <Leaf />, achieved: false },
      { id: 'food10kg', type: 'food', threshold: 10, text: 'You saved 10kg of food!', icon: <Leaf />, achieved: false },
      { id: 'co2_20kg', type: 'co2', threshold: 20, text: 'You reduced CO₂ by 20kg!', icon: <Globe />, achieved: false },
      { id: 'money50', type: 'money', threshold: 50, text: 'You saved $50 on groceries!', icon: <DollarSign />, achieved: false },
      { id: 'loyalty100', type: 'loyalty', threshold: 100, text: 'You earned 100 loyalty points!', icon: <Award />, achieved: false },
      { id: 'loyalty250', type: 'loyalty', threshold: 250, text: 'You earned 250 loyalty points!', icon: <Trophy />, achieved: false },
      { id: 'loyalty500', type: 'loyalty', threshold: 500, text: 'You reached Silver status!', icon: <Award />, achieved: false }
    ];
    
    // Check which milestones were achieved
    let achievedMilestones = milestones.filter(m => {
      switch(m.type) {
        case 'food': return impact.foodSaved >= m.threshold;
        case 'co2': return impact.co2Reduced >= m.threshold;
        case 'money': return impact.moneySaved >= m.threshold;
        case 'loyalty': return impact.loyaltyPoints >= m.threshold;
        default: return false;
      }
    });
    
    // For demo purposes, randomly show a milestone
    if (achievedMilestones.length > 0 && Math.random() > 0.5) {
      const randomMilestone = achievedMilestones[Math.floor(Math.random() * achievedMilestones.length)];
      setMilestone(randomMilestone);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => setMilestone(null), 5000);
    }
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
      <div className="dashboard-container container py-8">
        <div className="text-center loading-container">
          <motion.div 
            className="spinner spinner-primary mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading your sustainability impact...
          </motion.p>
        </div>
      </div>
    );
  }

  // Chart data for bar chart
  const barChartData = {
    labels: chartData.monthlyFoodSaved.map(d => d.month),
    datasets: [
      {
        label: 'Food Saved (kg)',
        data: chartData.monthlyFoodSaved.map(d => d.foodSaved),
        backgroundColor: 'rgba(4, 120, 87, 0.7)',
        borderColor: 'rgba(4, 120, 87, 1)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(4, 120, 87, 0.9)'
      }
    ]
  };
  
  // Chart data for doughnut chart
  const doughnutData = {
    labels: chartData.categoryBreakdown.map(d => d.category),
    datasets: [
      {
        data: chartData.categoryBreakdown.map(d => d.amount),
        backgroundColor: chartData.categoryBreakdown.map(d => d.color),
        borderColor: 'white',
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };
  
  // Chart data for line chart
  const lineChartData = {
    labels: chartData.savingsOverTime.map(d => d.month),
    datasets: [
      {
        label: 'Money Saved ($)',
        data: chartData.savingsOverTime.map(d => d.moneySaved),
        fill: true,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(255, 206, 86, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 206, 86, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        borderWidth: 1,
        borderColor: '#ddd',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: 12,
        displayColors: true
      }
    }
  };

  // Dashboard render
  return (
    <div className="dashboard-container container py-8">
      <ToastContainer />
      
      {/* Milestone popup animation */}
      <AnimatePresence>
        {milestone && (
          <motion.div 
            className="milestone-popup"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="milestone-content">
              <div className="milestone-icon">{milestone.icon}</div>
              <div className="milestone-text">
                <h4>Achievement Unlocked!</h4>
                <p>{milestone.text}</p>
              </div>
              <button 
                className="milestone-close" 
                onClick={() => setMilestone(null)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            className="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              className="share-modal"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>Share Your Impact</h3>
                <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
              </div>
              <div className="share-modal-content">
                <div className="share-impact-card">
                  <p className="share-brag">I've saved {impactData.foodSaved.toFixed(1)}kg of food and reduced CO₂ emissions by {impactData.co2Reduced.toFixed(1)}kg with FreshGuard! 🌿</p>
                  <p className="share-details">That's equivalent to planting {(impactData.co2Reduced / 10).toFixed(1)} trees! 🌳</p>
                </div>
                <div className="share-buttons">
                  <button className="share-btn facebook">
                    <span>Facebook</span>
                  </button>
                  <button className="share-btn twitter">
                    <span>Twitter</span>
                  </button>
                  <button className="share-btn email">
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header with tabs */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <motion.h1 
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BarChart3 className="mr-3" size={32} />
            Your Sustainability Impact
          </motion.h1>
          <motion.p 
            className="page-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Making a difference, one purchase at a time
          </motion.p>
        </div>
        <motion.div 
          className="dashboard-actions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="dashboard-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              Analytics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
          </div>
          <button 
            onClick={() => setShowShareModal(true)} 
            className="btn btn-secondary btn-with-icon share-btn"
          >
            <Share2 size={16} />
            Share
          </button>
          <div className="user-rank">
            <motion.div 
              className="rank-badge" 
              style={{ backgroundColor: getRankColor(impactData.rank) }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={24} />
              <span>{impactData.rank}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* User percentile indicator */}
      <motion.div 
        className="user-percentile"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="percentile-label">
          <Users size={16} />
          <span>You're in the top {100 - impactData.percentileRank}% of eco-conscious shoppers!</span>
        </div>
        <div className="percentile-bar">
          <motion.div 
            className="percentile-progress"
            initial={{ width: "0%" }}
            animate={{ width: `${impactData.percentileRank}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </div>
      </motion.div>

      {/* Main content based on active tab */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            className="overview-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Key Metrics with animated counters */}
            <div className="metrics-grid">
              <motion.div 
                className="metric-card highlight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="metric-icon">
                  <Leaf />
                </div>
                <div className="metric-content">
                  <motion.h3
                    key={animatedValues.foodSaved}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {animatedValues.foodSaved.toFixed(1)} kg
                  </motion.h3>
                  <p>Food Waste Prevented</p>
                  <div className="metric-trend positive">
                    <TrendingUp size={16} />
                    <span>+{(animatedValues.foodSaved * 0.15).toFixed(1)}kg this month</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="metric-icon">
                  <DollarSign />
                </div>
                <div className="metric-content">
                  <motion.h3
                    key={animatedValues.moneySaved}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    ${animatedValues.moneySaved.toFixed(2)}
                  </motion.h3>
                  <p>Money Saved</p>
                  <div className="metric-trend positive">
                    <TrendingUp size={16} />
                    <span>+${(animatedValues.moneySaved * 0.2).toFixed(2)} this month</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="metric-icon">
                  <Globe />
                </div>
                <div className="metric-content">
                  <motion.h3
                    key={animatedValues.co2Reduced}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {formatCO2(animatedValues.co2Reduced)}
                  </motion.h3>
                  <p>CO₂ Emissions Reduced</p>
                  <div className="metric-trend positive">
                    <TrendingUp size={16} />
                    <span>+{(animatedValues.co2Reduced * 0.12).toFixed(1)}kg this month</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="metric-icon">
                  <Sparkles />
                </div>
                <div className="metric-content">
                  <motion.h3
                    key={animatedValues.loyaltyPoints}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {animatedValues.loyaltyPoints}
                  </motion.h3>
                  <p>Loyalty Points</p>
                  <div className="metric-trend positive">
                    <TrendingUp size={16} />
                    <span>+{Math.floor(animatedValues.loyaltyPoints * 0.18)} this month</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Environmental Impact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="env-impact-section"
            >
              <div className="section-header">
                <h3>Your Environmental Impact</h3>
                <button 
                  onClick={loadDashboardData} 
                  disabled={loading}
                  className="btn btn-outline-primary btn-sm"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
              
              <div className="env-cards">
                <div className="env-card">
                  <div className="env-icon">
                    <Globe />
                  </div>
                  <div className="env-content">
                    <div className="env-value">
                      {Math.floor(impactData.co2Reduced / 8.5)}
                    </div>
                    <div className="env-label">
                      trees worth of CO₂ saved
                    </div>
                  </div>
                </div>
                
                <div className="env-card">
                  <div className="env-icon">
                    <Activity />
                  </div>
                  <div className="env-content">
                    <div className="env-value">
                      {impactData.waterSaved}
                    </div>
                    <div className="env-label">
                      liters of water conserved
                    </div>
                  </div>
                </div>
                
                <div className="env-card">
                  <div className="env-icon">
                    <Leaf />
                  </div>
                  <div className="env-content">
                    <div className="env-value">
                      {impactData.landSaved}
                    </div>
                    <div className="env-label">
                      m² of farmland preserved
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Additional Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="summary-section"
            >
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-header">
                    <Target size={20} />
                    <h4>Shopping Activity</h4>
                  </div>
                  <div className="summary-content">
                    <div className="summary-stat">
                      <span className="stat-value">{impactData.ordersCompleted}</span>
                      <span className="stat-label">Orders</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-value">6</span>
                      <span className="stat-label">Months Active</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-value">{Math.floor(impactData.loyaltyPoints / 20)}</span>
                      <span className="stat-label">Items Rescued</span>
                    </div>
                  </div>
                </div>
                
                <div className="summary-card">
                  <div className="summary-header">
                    <Trophy size={20} />
                    <h4>Next Milestone</h4>
                  </div>
                  <div className="summary-content milestone-content">
                    <div className="milestone-progress">
                      <div className="milestone-info">
                        <span className="milestone-goal">
                          {impactData.loyaltyPoints < 500 ? 'Reach Silver Status' : 'Reach Gold Status'}
                        </span>
                        <span className="milestone-value">
                          {impactData.loyaltyPoints < 500 ? 
                            `${impactData.loyaltyPoints}/500 points` : 
                            `${impactData.loyaltyPoints}/1000 points`}
                        </span>
                      </div>
                      <div className="milestone-bar">
                        <div 
                          className="milestone-bar-progress"
                          style={{ 
                            width: `${impactData.loyaltyPoints < 500 ? 
                              (impactData.loyaltyPoints / 500 * 100) : 
                              (impactData.loyaltyPoints / 1000 * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Featured Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="featured-chart-section"
            >
              <div className="featured-chart-container">
                <div className="section-header">
                  <h3>Your Sustainability Progress</h3>
                </div>
                <div className="featured-chart">
                  <Bar 
                    data={barChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                    height={250}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <motion.div 
            className="charts-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="charts-grid">
              <motion.div 
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Monthly Food Saved</h3>
                  </div>
                  <div className="chart-body">
                    <Bar 
                      data={barChartData}
                      options={chartOptions}
                      height={250}
                      ref={chartRefs.foodSavedRef}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Food Saved by Category</h3>
                  </div>
                  <div className="chart-body">
                    <Doughnut 
                      data={doughnutData}
                      options={{
                        ...chartOptions,
                        cutout: '65%',
                      }}
                      height={250}
                      ref={chartRefs.categoriesRef}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Money Saved Over Time</h3>
                  </div>
                  <div className="chart-body">
                    <Line 
                      data={lineChartData}
                      options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '$' + value;
                              }
                            },
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                      height={250}
                      ref={chartRefs.savingsRef}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Environmental Impact Comparison</h3>
                  </div>
                  <div className="chart-body">
                    <Radar 
                      data={chartData.impactRadar}
                      options={{
                        ...chartOptions,
                        scales: {
                          r: {
                            beginAtZero: true,
                            ticks: {
                              display: false
                            },
                            pointLabels: {
                              font: {
                                size: 11
                              }
                            }
                          }
                        },
                        elements: {
                          line: {
                            borderWidth: 3
                          }
                        }
                      }}
                      height={250}
                      ref={chartRefs.radarRef}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div 
            className="achievements-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="achievements-summary">
              <motion.div 
                className="achievement-stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="achievement-stat">
                  <h4>6/12</h4>
                  <p>Achievements Earned</p>
                </div>
                <div className="achievement-stat">
                  <h4>Bronze</h4>
                  <p>Current Rank</p>
                </div>
                <div className="achievement-stat">
                  <h4>{impactData.loyaltyPoints}</h4>
                  <p>Total Points</p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="achievements-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div 
                className="achievement-badge earned"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="achievement-icon">
                  <Check size={18} />
                </div>
                <Award size={32} />
                <span>First Order</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.foodSaved >= 10 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.foodSaved >= 10 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Leaf size={32} />
                <span>10kg Saved</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.moneySaved >= 25 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.moneySaved >= 25 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <DollarSign size={32} />
                <span>$25 Saved</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.co2Reduced >= 20 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.co2Reduced >= 20 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Globe size={32} />
                <span>20kg CO₂</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.ordersCompleted >= 5 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.ordersCompleted >= 5 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Target size={32} />
                <span>5 Orders</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.loyaltyPoints >= 100 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.loyaltyPoints >= 100 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Sparkles size={32} />
                <span>100 Points</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.loyaltyPoints >= 250 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.loyaltyPoints >= 250 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Trophy size={32} />
                <span>250 Points</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.loyaltyPoints >= 500 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.loyaltyPoints >= 500 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Award size={32} />
                <span>Silver Status</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.loyaltyPoints >= 1000 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.loyaltyPoints >= 1000 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Award size={32} />
                <span>Gold Status</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.foodSaved >= 50 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.foodSaved >= 50 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Leaf size={32} />
                <span>50kg Goal</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.percentileRank >= 90 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.percentileRank >= 90 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Users size={32} />
                <span>Top 10%</span>
              </motion.div>
              <motion.div 
                className={`achievement-badge ${impactData.co2Reduced >= 50 ? 'earned' : ''}`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {impactData.co2Reduced >= 50 && (
                  <div className="achievement-icon">
                    <Check size={18} />
                  </div>
                )}
                <Zap size={32} />
                <span>Climate Hero</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
