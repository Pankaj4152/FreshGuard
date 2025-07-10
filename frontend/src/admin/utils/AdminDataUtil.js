import adminsData from '../data/admins.json';
import dashboardData from '../data/dashboard.json';
import configData from '../data/config.json';

/**
 * Utility class for admin data operations
 */
class AdminDataUtil {
  /**
   * Get environment configuration
   */
  static getConfig() {
    const environment = process.env.NODE_ENV || 'development';
    return configData.environmentVariables[environment] || configData.environmentVariables.development;
  }

  /**
   * Check if we should use mock data
   */
  static useMockData() {
    const config = this.getConfig();
    return config.REACT_APP_USE_MOCK_DATA === 'true';
  }

  /**
   * Validate admin credentials
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Object|null} Admin data if valid, null if invalid
   */
  static validateCredentials(username, password) {
    // For a real application, this would verify against hashed passwords in a database
    // For this MVP, we're using plaintext comparison with mock data
    const admin = adminsData.admins.find(admin => admin.username === username && admin.password_hash === password);
    
    if (admin) {
      // Don't include password in returned data
      const { password_hash, ...adminData } = admin;
      return adminData;
    }
    
    return null;
  }

  /**
   * Get dashboard data
   * @returns {Object} Dashboard data
   */
  static getDashboardData() {
    return dashboardData.dashboard;
  }

  /**
   * Generate a mock JWT token (for demo purposes only)
   * @param {string} adminId - The admin ID
   * @returns {string} A mock JWT token
   */
  static generateMockToken(adminId) {
    // In a real app, this would be a proper JWT token
    return `mock-jwt-token-${adminId}-${Date.now()}`;
  }

  /**
   * Verify a token (mock implementation)
   * @param {string} token - The token to verify
   * @returns {boolean} Whether the token is valid
   */
  static verifyToken(token) {
    // In a real app, this would verify the JWT signature and expiration
    return token && token.startsWith('mock-jwt-token-');
  }

  /**
   * Check if a user has a specific permission
   * @param {Object} admin - Admin user object
   * @param {string} permission - Permission to check
   * @returns {boolean} Whether the admin has the permission
   */
  static hasPermission(admin, permission) {
    if (!admin || !admin.permissions) {
      return false;
    }
    return admin.permissions.includes(permission);
  }
}

export default AdminDataUtil;
