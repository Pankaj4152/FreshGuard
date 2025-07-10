import AdminDataUtil from '../utils/AdminDataUtil';
import apiService from '../../services/api';

/**
 * API service for admin-specific operations
 */
class AdminApiService {
  /**
   * Login to admin panel
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      // Check if we should use mock data
      if (AdminDataUtil.useMockData()) {
        // Validate credentials against mock data
        const adminData = AdminDataUtil.validateCredentials(credentials.username, credentials.password);
        
        if (adminData) {
          // Generate a mock token
          const token = AdminDataUtil.generateMockToken(adminData.id);
          
          return {
            success: true,
            admin: adminData,
            token: token
          };
        } else {
          return {
            success: false,
            error: 'Invalid credentials'
          };
        }
      } else {
        // In production, call the real API
        return await apiService.adminLogin(credentials);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Verify admin token
   * @param {string} token - The token to verify
   * @returns {Promise<Object>} Verification response
   */
  async verifyToken(token) {
    try {
      if (AdminDataUtil.useMockData()) {
        // Verify the token locally
        const isValid = AdminDataUtil.verifyToken(token);
        
        return {
          success: isValid
        };
      } else {
        // In production, call the real API
        return await apiService.verifyAdminToken(token);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  /**
   * Get dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData() {
    try {
      if (AdminDataUtil.useMockData()) {
        // Get mock dashboard data
        const dashboardData = AdminDataUtil.getDashboardData();
        
        return {
          success: true,
          data: dashboardData
        };
      } else {
        // In production, call the real API
        return await apiService.getAdminDashboard();
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load dashboard data'
      };
    }
  }
}

// Create and export a singleton instance
const adminApiService = new AdminApiService();
export default adminApiService;
