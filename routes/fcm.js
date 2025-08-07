const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');
const authMiddleware = require('../middleware/auth');

// Register FCM token
router.post('/register-token', authMiddleware, fcmController.registerFCMToken);

// Unregister FCM token
router.post('/unregister-token', authMiddleware, fcmController.unregisterFCMToken);

// Send test notification
router.post('/send-test-notification', authMiddleware, fcmController.sendTestNotification);

// Send simple test notification to any device token
router.post('/send-test', authMiddleware, fcmController.sendSimpleTestNotification);

// Get user's FCM tokens
router.get('/my-tokens', authMiddleware, fcmController.getUserTokens);

module.exports = router;
