const { LogLogin } = require('../models');
const UAParser = require('ua-parser-js');

/**
 * Login Logging Service
 * Handles all login-related logging functionality
 */
class LoginLogService {
  
  /**
   * Extract device information from user agent
   * @param {string} userAgent - User agent string
   * @returns {object} Parsed device information
   */
  static parseDeviceInfo(userAgent) {
    if (!userAgent) return null;
    
    try {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      
      return {
        browser: {
          name: result.browser.name || 'Unknown',
          version: result.browser.version || 'Unknown'
        },
        os: {
          name: result.os.name || 'Unknown',
          version: result.os.version || 'Unknown'
        },
        device: {
          type: result.device.type || 'desktop',
          vendor: result.device.vendor || 'Unknown',
          model: result.device.model || 'Unknown'
        },
        engine: {
          name: result.engine.name || 'Unknown',
          version: result.engine.version || 'Unknown'
        },
        cpu: {
          architecture: result.cpu.architecture || 'Unknown'
        }
      };
    } catch (error) {
      console.error('❌ Error parsing user agent:', error.message);
      return { error: 'Failed to parse user agent', raw: userAgent };
    }
  }

  /**
   * Extract IP address from request
   * @param {object} req - Express request object
   * @returns {string} IP address
   */
  static extractIpAddress(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           'unknown';
  }

  /**
   * Log successful login
   * @param {object} options - Login logging options
   * @param {number} options.userId - User ID
   * @param {object} options.req - Express request object
   * @param {string} options.token - Authentication token
   * @returns {Promise<object>} Created login log entry
   */
  static async logLogin({ userId, req, token }) {
    try {
      const userAgent = req.headers ? req.headers['user-agent'] : null;
      const ipAddress = this.extractIpAddress(req);
      const deviceInfo = this.parseDeviceInfo(userAgent);

      const loginLog = await LogLogin.create({
        user_id: userId,
        user_agent: userAgent || null,
        ip_address: ipAddress,
        mac_address: null, // MAC address is not typically available in web requests
        device_info: deviceInfo,
        token: token || null,
        login_at: new Date(),
        logout_at: null
      });

      console.log(`🔐 Login logged for user ${userId} from IP ${ipAddress}`, {
        loginLogId: loginLog.id,
        deviceType: deviceInfo?.device?.type || 'unknown',
        browser: deviceInfo?.browser?.name || 'unknown',
        os: deviceInfo?.os?.name || 'unknown'
      });

      return loginLog;
    } catch (error) {
      console.error('❌ Error logging login:', error.message);
      // Don't throw error - login should not fail because of logging issues
      return null;
    }
  }

  /**
   * Log logout
   * @param {object} options - Logout logging options
   * @param {number} options.userId - User ID
   * @param {string} [options.token] - Authentication token
   * @returns {Promise<boolean>} Success status
   */
  static async logLogout({ userId, token }) {
    try {
      // Find the most recent login entry for this user without a logout timestamp
      const conditions = {
        user_id: userId,
        logout_at: null
      };

      // If token is provided, match it as well
      if (token) {
        conditions.token = token;
      }

      const [updatedCount] = await LogLogin.update(
        { logout_at: new Date() },
        { 
          where: conditions,
          order: [['login_at', 'DESC']],
          limit: 1
        }
      );

      if (updatedCount > 0) {
        console.log(`🔓 Logout logged for user ${userId}`);
        return true;
      } else {
        console.log(`⚠️ No active login session found for user ${userId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error logging logout:', error.message);
      return false;
    }
  }

  /**
   * Get login history for a user
   * @param {object} options - Query options
   * @param {number} options.userId - User ID
   * @param {number} [options.limit=10] - Number of records to retrieve
   * @param {number} [options.offset=0] - Offset for pagination
   * @returns {Promise<object>} Login history with pagination info
   */
  static async getLoginHistory({ userId, limit = 10, offset = 0 }) {
    try {
      const { count, rows } = await LogLogin.findAndCountAll({
        where: { user_id: userId },
        order: [['login_at', 'DESC']],
        limit: Math.min(limit, 100), // Max 100 records per request
        offset: offset,
        attributes: [
          'id',
          'user_agent',
          'ip_address',
          'device_info',
          'login_at',
          'logout_at'
        ]
      });

      return {
        total: count,
        limit,
        offset,
        logs: rows.map(log => ({
          id: log.id,
          ip_address: log.ip_address,
          device_info: log.device_info,
          login_at: log.login_at,
          logout_at: log.logout_at,
          session_duration: log.logout_at && log.login_at ? 
            Math.round((new Date(log.logout_at) - new Date(log.login_at)) / 1000) : null, // Duration in seconds
          is_active: !log.logout_at
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching login history:', error.message);
      throw error;
    }
  }

  /**
   * Get active sessions for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Active login sessions
   */
  static async getActiveSessions(userId) {
    try {
      const activeSessions = await LogLogin.findAll({
        where: {
          user_id: userId,
          logout_at: null
        },
        order: [['login_at', 'DESC']],
        attributes: [
          'id',
          'ip_address',
          'device_info',
          'login_at',
          'token'
        ]
      });

      return activeSessions.map(session => ({
        id: session.id,
        ip_address: session.ip_address,
        device_info: session.device_info,
        login_at: session.login_at,
        duration: Math.round((new Date() - new Date(session.login_at)) / 1000), // Duration in seconds
        has_token: !!session.token
      }));
    } catch (error) {
      console.error('❌ Error fetching active sessions:', error.message);
      throw error;
    }
  }

  /**
   * Cleanup old login logs
   * @param {number} [daysToKeep=90] - Number of days to keep logs
   * @returns {Promise<number>} Number of deleted records
   */
  static async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deletedCount = await LogLogin.destroy({
        where: {
          login_at: {
            [require('sequelize').Op.lt]: cutoffDate
          }
        }
      });

      console.log(`🧹 Cleaned up ${deletedCount} old login logs (older than ${daysToKeep} days)`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error.message);
      throw error;
    }
  }
}

module.exports = LoginLogService;
