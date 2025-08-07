const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Admin Authentication Middleware
 * Checks if user is authenticated and has state/collector/hospital role
 */
const adminAuth = async (req, res, next) => {
  try {
    let token = null;

    // Check session first
    if (req.session && req.session.adminToken) {
      token = req.session.adminToken;
    }
    // Check remember me cookie
    else if (req.cookies && req.cookies.adminRemember) {
      token = req.cookies.adminRemember;
    }

    if (!token) {
      req.flash('error', 'कृपया पहले लॉगिन करें');
      return res.redirect('/admin/login');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists and is active
      const user = await User.findOne({
        where: { id: decoded.userId, is_active: true },
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (!user) {
        req.flash('error', 'उपयोगकर्ता खाता नहीं मिला या निष्क्रिय है');
        return res.redirect('/admin/login');
      }

      // Check if user has state, collector, or hospital role (state acts as admin)
      if (!['state', 'collector', 'hospital'].includes(user.role.name)) {
        req.flash('error', 'आपको प्रशासक पैनल का उपयोग करने का अधिकार नहीं है');
        return res.redirect('/admin/login');
      }

      // Add user info to request object
      req.user = {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        district_id: user.district_id,
        block_id: user.block_id,
        hospital_name: user.hospital_name,
        last_login: user.last_login
      };

      // Update session if needed
      if (!req.session.adminUser) {
        req.session.adminUser = req.user;
      }

      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      
      // Clear invalid token
      req.session.adminToken = null;
      req.session.adminUser = null;
      res.clearCookie('adminRemember');
      
      req.flash('error', 'आपका सत्र समाप्त हो गया है। कृपया फिर से लॉगिन करें');
      return res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    req.flash('error', 'प्रमाणीकरण त्रुटि। कृपया फिर से लॉगिन करें');
    return res.redirect('/admin/login');
  }
};

/**
 * Role-based authorization middleware
 * @param {string|array} roles - Required roles (state, collector, hospital, etc.)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.flash('error', 'कृपया पहले लॉगिन करें');
      return res.redirect('/admin/login');
    }

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      req.flash('error', 'आपको इस पृष्ठ तक पहुंचने का अधिकार नहीं है');
      return res.redirect('/admin/dashboard');
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * @param {string} permission - Required permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      req.flash('error', 'कृपया पहले लॉगिन करें');
      return res.redirect('/admin/login');
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
      req.flash('error', 'आपको इस कार्य को करने का अधिकार नहीं है');
      return res.redirect('/admin/dashboard');
    }

    next();
  };
};

/**
 * Optional admin authentication
 * Used for pages that can be accessed by both authenticated and unauthenticated users
 */
const optionalAdminAuth = async (req, res, next) => {
  try {
    let token = null;

    // Check session first
    if (req.session && req.session.adminToken) {
      token = req.session.adminToken;
    }
    // Check remember me cookie
    else if (req.cookies && req.cookies.adminRemember) {
      token = req.cookies.adminRemember;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({
          where: { id: decoded.userId, is_active: true },
          include: [{
            model: Role,
            as: 'role',
            attributes: ['name', 'permissions']
          }]
        });

        if (user && ['state', 'collector', 'hospital'].includes(user.role.name)) {
          req.user = {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            role: user.role.name,
            permissions: user.role.permissions,
            district_id: user.district_id,
            block_id: user.block_id,
            hospital_name: user.hospital_name,
            last_login: user.last_login
          };
        }
      } catch (tokenError) {
        // Token is invalid, but we don't redirect for optional auth
        req.session.adminToken = null;
        req.session.adminUser = null;
        res.clearCookie('adminRemember');
      }
    }

    next();
  } catch (error) {
    console.error('Optional admin auth error:', error);
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  adminAuth,
  requireRole,
  requirePermission,
  optionalAdminAuth
};
