const { FCMToken, User } = require('../models');
const PushNotificationService = require('../services/pushNotificationService');

const registerFCMToken = async (req, res) => {
  try {
    const { token, device_type, device_id, app_version } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!token || !device_type) {
      return res.status(400).json({
        success: false,
        message: 'Token and device_type are required'
      });
    }

    // Validate token format
    if (!PushNotificationService.isValidToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FCM token format'
      });
    }

    // Check if token already exists for this user
    const existingToken = await FCMToken.findOne({
      where: { token: token }
    });

    if (existingToken) {
      // Update existing token
      await existingToken.update({
        user_id: userId,
        device_type: device_type,
        device_id: device_id,
        app_version: app_version,
        is_active: true,
        last_used: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'FCM token updated successfully',
        data: {
          token_id: existingToken.id,
          token: existingToken.token
        }
      });
    }

    // Create new token record
    const fcmToken = await FCMToken.create({
      user_id: userId,
      token: token,
      device_type: device_type,
      device_id: device_id,
      app_version: app_version,
      is_active: true,
      last_used: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'FCM token registered successfully',
      data: {
        token_id: fcmToken.id,
        token: fcmToken.token
      }
    });

  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const unregisterFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const fcmToken = await FCMToken.findOne({
      where: { 
        token: token,
        user_id: userId 
      }
    });

    if (!fcmToken) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    await fcmToken.update({ is_active: false });

    res.json({
      success: true,
      message: 'FCM token unregistered successfully'
    });

  } catch (error) {
    console.error('Unregister FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { title, body, data = {} } = req.body;
    const userId = req.user.id;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    // Get user's active FCM tokens
    const fcmTokens = await FCMToken.findAll({
      where: { 
        user_id: userId,
        is_active: true 
      }
    });

    if (fcmTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active FCM tokens found for user'
      });
    }

    const results = [];
    
    // Send notification to all user's devices
    for (const fcmToken of fcmTokens) {
      const result = await PushNotificationService.sendGeneralNotification(
        fcmToken.token,
        title,
        body,
        data
      );
      
      results.push({
        token_id: fcmToken.id,
        device_type: fcmToken.device_type,
        ...result
      });

      // Update last_used timestamp
      await fcmToken.update({ last_used: new Date() });
    }

    res.json({
      success: true,
      message: 'Test notification sent',
      data: {
        sent_to_devices: results.length,
        results: results
      }
    });

  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const sendSimpleTestNotification = async (req, res) => {
  try {
    const { title, body, device_token, data = {}, priority = 'high', sound = 'default' } = req.body;

    if (!title || !body || !device_token) {
      return res.status(400).json({
        success: false,
        message: 'Title, body, and device_token are required'
      });
    }

    // Send notification using PushNotificationService
    const result = await PushNotificationService.sendToDevice(
      device_token,
      { title, body },
      { 
        ...data, 
        test: true, 
        sent_by: req.user.id,
        timestamp: new Date().toISOString() 
      },
      { priority, sound }
    );

    res.json({
      success: true,
      message: result.success ? 'Test notification sent successfully!' : 'Failed to send notification',
      data: {
        notification: { title, body },
        target_token: device_token,
        firebase_result: result,
        sent_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send simple test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get user's FCM tokens
 */
const getUserTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    const tokens = await FCMToken.findAll({
      where: { user_id: userId },
      attributes: ['id', 'device_type', 'device_id', 'app_version', 'is_active', 'last_used', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'User tokens retrieved successfully',
      data: {
        total_tokens: tokens.length,
        active_tokens: tokens.filter(t => t.is_active).length,
        tokens: tokens
      }
    });

  } catch (error) {
    console.error('Get user tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Utility function to get user's active FCM tokens
 * This can be used by other controllers
 */
const getUserActiveFCMTokens = async (userId) => {
  try {
    const tokens = await FCMToken.findAll({
      where: { 
        user_id: userId,
        is_active: true 
      },
      attributes: ['token', 'device_type']
    });

    return tokens.map(token => token.token);
  } catch (error) {
    console.error('Get user active FCM tokens error:', error);
    return [];
  }
};

module.exports = {
  registerFCMToken,
  unregisterFCMToken,
  sendTestNotification,
  getUserTokens,
  getUserActiveFCMTokens,
  sendSimpleTestNotification
};
