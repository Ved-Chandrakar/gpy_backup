const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { Op } = require('sequelize');
const { validateRequest, schemas } = require('../middleware/validation');
const { blacklistToken } = require('../utils/tokenBlacklist');
const { 
  generateRefreshToken, 
  storeRefreshToken, 
  validateRefreshToken, 
  removeRefreshToken 
} = require('../utils/refreshTokenManager');
const LoginLogService = require('../services/LoginLogService');

const login = async (req, res) => {
  try {
    const { userId, password, loginType } = req.body;

    // Validate input
    if (!userId || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: 'User ID, password, and loginType are required'
      });
    }

    // Find user with role information
    const user = await User.findOne({
      where: { userid: userId, is_active: true },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if the role is allowed for mobile app login and matches loginType
    const allowedRoles = ['hospital', 'mother', 'mitanin', 'aww'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This role is not allowed to login via mobile app'
      });
    }

    // Validate that loginType matches user's actual role
    if (loginType !== user.role.name) {
      return res.status(403).json({
        success: false,
        message: `Invalid login type. User belongs to '${user.role.name}' role but attempted to login as '${loginType}'`
      });
    }

    // Check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Log successful login
    try {
      await LoginLogService.logLogin({ 
        userId: user.id, 
        req: req, 
        token: token 
      });
    } catch (logError) {
      console.error('Failed to log login:', logError);
      // Don't fail the login if logging fails
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
    
    // Store refresh token
    storeRefreshToken(user.id, refreshToken, refreshTokenExpiry);

    // Remove password from response
    const userResponse = {
      id: user.id,
      userid: user.userid,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      district_id: user.district_id,
      block_id: user.block_id,
      hospital_name: user.hospital_name,
      last_login: user.last_login
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Admin Login Page
 */
const adminLoginPage = async (req, res) => {
  try {
    // Check if user is already logged in
    const token = req.session.adminToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'state') {
          return res.redirect('/admin/dashboard');
        }
      } catch (error) {
        // Invalid token, clear session
        req.session.adminToken = null;
      }
    }

    // Handle logout messages from query parameters
    let message = null;
    if (req.query.message === 'logout_success') {
      req.flash('success', 'सफलतापूर्वक लॉगआउट हुआ');
    } else if (req.query.message === 'logout_error') {
      req.flash('error', 'लॉगआउट करने में त्रुटि हुई');
    }

    res.render('auth/admin-login', { 
      title: 'एडमिन लॉगिन'
    });
  } catch (error) {
    console.error('Admin login page error:', error);
    res.status(500).render('error', { 
      title: 'त्रुटि',
      error: 'पृष्ठ लोड करने में त्रुटि' 
    });
  }
};

/**
 * Admin Login Handler
 */
const adminLogin = async (req, res) => {
  try {
    const { mobile, password, remember } = req.body;

    console.log('--- Login Attempt Start ---');
    console.log('Input Received:', req.body);

    // Validate input
    if (!mobile || !password) {
      console.log('Validation Failed: Missing mobile or password');
      req.flash('error', 'कृपया यूजरनेम/मोबाइल नंबर और पासवर्ड दर्ज करें');
      return res.redirect('/admin/login');
    }

    const isMobileNumber = /^\d{10}$/.test(mobile);
    console.log('Is Mobile Number:', isMobileNumber);

    if (isMobileNumber) {
      if (!/^\d{10}$/.test(mobile)) {
        console.log('Invalid mobile format');
        req.flash('error', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
        return res.redirect('/admin/login');
      }
    } else {
      if (!/^[a-zA-Z0-9_]+$/.test(mobile)) {
        console.log('Invalid username format');
        req.flash('error', 'कृपया वैध यूजरनेम दर्ज करें');
        return res.redirect('/admin/login');
      }
    }

    console.log('Searching user in DB...');
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { mobile },
          { userid: mobile }
        ],
        is_active: true
      },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!user) {
      console.log('User not found or inactive');
      req.flash('error', 'अमान्य यूजरनेम/मोबाइल नंबर या पासवर्ड');
      return res.redirect('/admin/login');
    }

    console.log('User found:', {
      id: user.id,
      name: user.name,
      role: user.role.name,
    });

    if (!['state', 'collector', 'hospital'].includes(user.role.name)) {
      console.log('Unauthorized role:', user.role.name);
      req.flash('error', 'आपको एडमिन पैनल का उपयोग करने का अधिकार नहीं है');
      return res.redirect('/admin/login');
    }

    const isMatch = await user.checkPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid password');
      req.flash('error', 'अमान्य यूजरनेम/मोबाइल नंबर या पासवर्ड');
      return res.redirect('/admin/login');
    }

    console.log('Password matched. Updating last login...');
    await user.update({ last_login: new Date() });

    const tokenExpiry = remember ? '30d' : '1d';
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        name: user.name,
        mobile: user.mobile
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    console.log('JWT Token generated:', token);

    try {
      await LoginLogService.logLogin({
        userId: user.id,
        req: req,
        token: token
      });
      console.log('Login log saved');
    } catch (logError) {
      console.error('Failed to log admin login:', logError);
    }

    req.session.adminToken = token;
    req.session.adminUser = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role.name,
      hospital_name: user.hospital_name,
      last_login: user.last_login
    };
    console.log('Session set:', req.session.adminUser);

    if (remember) {
      res.cookie('adminRemember', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
      console.log('Remember-me cookie set');
    }

    console.log('Login successful. Redirecting to dashboard...');
    console.log('Session at dashboard:', req.session.adminUser);
    req.flash('success', 'सफलतापूर्वक लॉगिन हुआ');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    req.flash('error', 'लॉगिन करने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    res.redirect('/admin/login');
  }
};


/**
 * Admin Logout Handler
 */
const adminLogout = async (req, res) => {
  try {
    // Log logout if user is available in session
    if (req.session && req.session.adminUser) {
      try {
        await LoginLogService.logLogout({ 
          userId: req.session.adminUser.id, 
          req: req, 
          token: req.session.adminToken 
        });
      } catch (logError) {
        console.error('Failed to log admin logout:', logError);
        // Don't fail the logout if logging fails
      }
    }
    
    // Clear session data
    if (req.session) {
      req.session.adminToken = null;
      req.session.adminUser = null;
    }
    
    // Clear remember me cookie
    res.clearCookie('adminRemember');
    
    // Destroy session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        // Redirect with success message as query parameter
        res.redirect('/admin/login?message=logout_success');
      });
    } else {
      // If no session, just redirect with message
      res.redirect('/admin/login?message=logout_success');
    }
  } catch (error) {
    console.error('Admin logout error:', error);
    // Redirect with error message
    res.redirect('/admin/login?message=logout_error');
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    // Get the token from the request (set by auth middleware)
    const token = req.token;
    
    if (token) {
      // Add token to blacklist to invalidate it
      blacklistToken(token);
      console.log(`Token blacklisted for user ${req.user.id}`);
    }
    
    // Log logout
    try {
      await LoginLogService.logLogout({ 
        userId: req.user.id, 
        req: req, 
        token: token 
      });
    } catch (logError) {
      console.error('Failed to log logout:', logError);
      // Don't fail the logout if logging fails
    }
    
    res.json({
      success: true,
      message: 'Logout successful. Token has been invalidated.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * Forgot Password Page
 */
const forgotPasswordPage = async (req, res) => {
  try {
    res.render('auth/forgot-password', { 
      title: 'पासवर्ड भूल गए'
    });
  } catch (error) {
    console.error('Forgot password page error:', error);
    res.status(500).render('error', { 
      title: 'त्रुटि',
      error: 'पृष्ठ लोड करने में त्रुटि' 
    });
  }
};

/**
 * Forgot Password Handler
 */
const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      req.flash('error', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return res.redirect('/admin/forgot-password');
    }

    // Find user
    const user = await User.findOne({
      where: { mobile, is_active: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      req.flash('success', 'यदि यह मोबाइल नंबर पंजीकृत है तो आपको पासवर्ड रीसेट का लिंक मिलेगा');
      return res.redirect('/admin/forgot-password');
    }

    // Generate reset token (implement according to your needs)
    // For now, just show success message
    req.flash('success', 'पासवर्ड रीसेट का लिंक आपके मोबाइल पर भेजा गया है');
    res.redirect('/admin/forgot-password');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error', 'पासवर्ड रीसेट करने में त्रुटि हुई');
    res.redirect('/admin/forgot-password');
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.checkPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password (will be hashed by the beforeUpdate hook)
    await user.update({ password: newPassword });

    console.log(`Password changed for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};


const setDefaultPasswordUsingHook = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const defaultPassword = 'gpy@2025';

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required in URL'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ password: defaultPassword }); // Sequelize hook hashes it

    console.log(`Default password set for user ${userId}`);
    res.json({
      success: true,
      message: 'Password reset to default successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};


const tokenRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate refresh token and get user
    const user = await validateRefreshToken(refreshToken);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get user with role information
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!userWithRole || !userWithRole.is_active) {
      // Remove invalid refresh token
      removeRefreshToken(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: userWithRole.id, role: userWithRole.role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
    
    // Remove old refresh token and store new one
    removeRefreshToken(refreshToken);
    storeRefreshToken(userWithRole.id, newRefreshToken, refreshTokenExpiry);

    console.log(`Token refreshed for user ${userWithRole.id}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
};

const resetPasswordSimple = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find user by userId (could be mobile, userid, or email)
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { userid: userId },
          { mobile: userId },
          { email: userId }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set password to gpy@2025
    const newPassword = 'gpy@2025';
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId: user.userid,
        mobile: user.mobile,
        newPassword: newPassword,
        resetAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Simple password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getLoginHistory = async (req, res) => {
  try {
    const { user_id, page = 1, limit = 20 } = req.query;
    
    // Determine which user's history to fetch
    const targetUserId = user_id ? parseInt(user_id) : req.user.id;
    
    // Validate that state users can view any user's history, others can only view their own
    if (targetUserId !== req.user.id && !['state'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own login history'
      });
    }
    
    // Get login history
    const history = await LoginLogService.getLoginHistory({ 
      userId: targetUserId, 
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Format response to match expected API structure
    const formattedHistory = {
      total: history.total,
      page: parseInt(page),
      limit: parseInt(limit),
      records: history.logs.map(log => ({
        id: log.id,
        login_time: log.login_at,
        logout_time: log.logout_at,
        ip_address: log.ip_address,
        device_info: log.device_info,
        session_duration_seconds: log.session_duration,
        is_active: log.is_active,
        login_type: log.device_info?.device?.type === 'mobile' ? 'mobile' : 'web'
      }))
    };
    
    res.json({
      success: true,
      message: 'Login history retrieved successfully',
      data: formattedHistory
    });
    
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching login history'
    });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    // Determine which user's sessions to fetch
    const targetUserId = user_id ? parseInt(user_id) : req.user.id;
    
    // Validate that state users can view any user's sessions, others can only view their own
    if (targetUserId !== req.user.id && !['state'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own active sessions'
      });
    }
    
    // Get active sessions count
    const activeSessions = await LoginLogService.getActiveSessions(targetUserId);
    
    res.json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: {
        user_id: targetUserId,
        active_sessions_count: activeSessions
      }
    });
    
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active sessions'
    });
  }
};

module.exports = {
  login: [validateRequest(schemas.login), login],
  getProfile,
  logout,
  changePassword: [validateRequest(schemas.changePassword), changePassword],
  tokenRefresh: [validateRequest(schemas.tokenRefresh), tokenRefresh],
  adminLoginPage,
  adminLogin,
  adminLogout,
  forgotPasswordPage,
  forgotPassword,
  resetPasswordSimple,
  getLoginHistory,
  getActiveSessions,
  setDefaultPasswordUsingHook
};
