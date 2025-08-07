const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// API Authentication routes (for mobile app, etc.)
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/refresh', authController.tokenRefresh);

// Login History & Sessions (Users can view their own, admins can view any user's)
router.get('/login-history', authMiddleware, authController.getLoginHistory);
router.get('/active-sessions', authMiddleware, authController.getActiveSessions);

// Simple password reset (no token required)
router.post('/reset-password-simple', authController.resetPasswordSimple);

// Note: Admin authentication routes have been moved to /admin/* 
// and are handled in routes/admin.js

module.exports = router;
