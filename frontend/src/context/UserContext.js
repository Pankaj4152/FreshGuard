import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'user1', // Default user for demo
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    loyaltyPoints: 0,
    isLoading: false
  });
  const [alerts, setAlerts] = useState([]);
  const [userImpact, setUserImpact] = useState({
    items_saved: 0,
    food_saved_kg: 0,
    co2_saved_kg: 0,
    money_saved: 0,
    loyalty_points: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        loadLoyaltyPoints(),
        loadAlerts(),
        loadUserImpact()
      ]);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLoyaltyPoints = async () => {
    try {
      const response = await apiService.getLoyaltyPoints(user.id);
      if (response.success) {
        setUser(prev => ({
          ...prev,
          loyaltyPoints: response.loyalty_points
        }));
      }
    } catch (err) {
      console.error('Error loading loyalty points:', err);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await apiService.getAlerts(user.id);
      if (response.success) {
        setAlerts(response.alerts || []);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  const loadUserImpact = async () => {
    try {
      const response = await apiService.getUserImpact(user.id);
      if (response.success) {
        setUserImpact(response.impact || {
          items_saved: 0,
          food_saved_kg: 0,
          co2_saved_kg: 0,
          money_saved: 0,
          loyalty_points: 0
        });
      }
    } catch (err) {
      console.error('Error loading user impact:', err);
    }
  };

  const refreshUserData = async () => {
    await loadUserData();
  };

  const updateUserProfile = (updates) => {
    setUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addLoyaltyPoints = (points) => {
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + points
    }));
  };

  const updateUserImpact = (newImpact) => {
    setUserImpact(prev => ({
      ...prev,
      ...newImpact,
      food_saved_kg: (prev.food_saved_kg || 0) + (newImpact.foodSaved || 0),
      money_saved: (prev.money_saved || 0) + (newImpact.moneySaved || 0),
      loyalty_points: (prev.loyalty_points || 0) + (newImpact.loyaltyPoints || 0)
    }));
  };

  const getAlertsByType = (type) => {
    switch (type) {
      case 'critical':
        return alerts.filter(alert => alert.days_left <= 1);
      case 'warning':
        return alerts.filter(alert => alert.days_left <= 2 && alert.days_left > 1);
      default:
        return alerts;
    }
  };

  const getCriticalAlerts = () => getAlertsByType('critical');
  const getWarningAlerts = () => getAlertsByType('warning');
  const getAllAlerts = () => alerts;

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.item_id !== alertId));
  };

  const calculateLoyaltyTier = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    if (points >= 100) return 'Bronze';
    return 'Member';
  };

  const getNextTierProgress = (points) => {
    const tiers = [
      { name: 'Member', min: 0, max: 99 },
      { name: 'Bronze', min: 100, max: 499 },
      { name: 'Silver', min: 500, max: 999 },
      { name: 'Gold', min: 1000, max: Infinity }
    ];

    const currentTier = tiers.find(tier => points >= tier.min && points <= tier.max);
    
    if (!currentTier || currentTier.name === 'Gold') {
      return { progress: 100, nextTier: null, pointsNeeded: 0 };
    }

    const nextTier = tiers.find(tier => tier.min > currentTier.max);
    const progress = ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100;
    const pointsNeeded = nextTier.min - points;

    return {
      progress: Math.min(progress, 100),
      nextTier: nextTier.name,
      pointsNeeded: Math.max(pointsNeeded, 0)
    };
  };

  const value = {
    user,
    alerts,
    userImpact,
    loading,
    error,
    loadUserData,
    refreshUserData,
    updateUserProfile,
    updateUserImpact,
    addLoyaltyPoints,
    loadLoyaltyPoints,
    loadAlerts,
    loadUserImpact,
    getAlertsByType,
    getCriticalAlerts,
    getWarningAlerts,
    getAllAlerts,
    dismissAlert,
    calculateLoyaltyTier,
    getNextTierProgress,
    setError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
