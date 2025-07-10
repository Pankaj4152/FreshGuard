import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const checkAdminAuth = async () => {
      try {
        setLoading(true);
        const storedAdmin = localStorage.getItem('adminUser');
        const storedToken = localStorage.getItem('adminToken');
        
        if (storedAdmin && storedToken) {
          // Verify token with backend
          const response = await apiService.verifyAdminToken(storedToken);
          
          if (response.success) {
            setAdmin(JSON.parse(storedAdmin));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            setAdmin(null);
          }
        }
      } catch (err) {
        setError('Authentication verification failed');
        console.error('Error verifying admin authentication:', err);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, this would call your API
      // For this MVP, we'll simulate authentication
      // const response = await apiService.adminLogin(credentials);
      
      // Mock admin authentication
      if (credentials.username === 'admin' && credentials.password === 'walmart123') {
        const adminData = {
          id: 'admin-1',
          name: 'Store Admin',
          email: 'admin@walmart.com',
          role: 'store_admin',
          storeId: 'store-123',
          storeName: 'Walmart Supercenter #123'
        };
        
        // Store admin data and token in localStorage
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.setItem('adminToken', 'mock-jwt-token-for-admin');
        
        setAdmin(adminData);
        return { success: true };
      } else {
        setError('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
