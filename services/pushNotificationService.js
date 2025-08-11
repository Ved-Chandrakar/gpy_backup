const { getFirebaseAdmin } = require('../config/firebase');

/**
 * Firebase Push Notification Service
 * Reusable functions for sending push notifications
 */
class PushNotificationService {
  
  /**
   * Send notification to a single device
   * @param {string} token - FCM token of the device
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload (optional)
   * @param {Object} options - Additional options (optional)
   * @returns {Promise<Object>} - Firebase response
   */
  static async sendToDevice(token, notification, data = {}, options = {}) {
    try {
      const admin = getFirebaseAdmin();
      
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
          ...notification
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: options.priority || 'high',
          notification: {
            sound: options.sound || 'default',
            click_action: options.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            channel_id: options.channelId || 'high_importance_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: options.sound || 'default',
              badge: options.badge || 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      console.log('✅ Push notification sent successfully:', response);
      return {
        success: true,
        messageId: response,
        token: token
      };
      
    } catch (error) {
      console.error('❌ Push notification error:', error);
      return {
        success: false,
        error: error.message,
        token: token
      };
    }
  }

  /**
   * Send notification to multiple devices
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload (optional)
   * @param {Object} options - Additional options (optional)
   * @returns {Promise<Object>} - Firebase response with success/failure counts
   */
  static async sendToMultipleDevices(tokens, notification, data = {}, options = {}) {
    try {
      const admin = getFirebaseAdmin();
      
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...notification
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: options.priority || 'high',
          notification: {
            sound: options.sound || 'default',
            click_action: options.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            channel_id: options.channelId || 'high_importance_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: options.sound || 'default',
              badge: options.badge || 1
            }
          }
        },
        tokens: tokens
      };

      const response = await admin.messaging().sendMulticast(message);
      
      console.log('✅ Multicast notification sent:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        failedTokens: this.getFailedTokens(tokens, response.responses)
      };
      
    } catch (error) {
      console.error('❌ Multicast notification error:', error);
      return {
        success: false,
        error: error.message,
        tokens: tokens
      };
    }
  }

  /**
   * Send notification to a topic (for broadcasting)
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload (optional)
   * @param {Object} options - Additional options (optional)
   * @returns {Promise<Object>} - Firebase response
   */
  static async sendToTopic(topic, notification, data = {}, options = {}) {
    try {
      const admin = getFirebaseAdmin();
      
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          ...notification
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: options.priority || 'high',
          notification: {
            sound: options.sound || 'default',
            click_action: options.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            channel_id: options.channelId || 'high_importance_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: options.sound || 'default',
              badge: options.badge || 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      console.log('✅ Topic notification sent successfully:', response);
      return {
        success: true,
        messageId: response,
        topic: topic
      };
      
    } catch (error) {
      console.error('❌ Topic notification error:', error);
      return {
        success: false,
        error: error.message,
        topic: topic
      };
    }
  }

  /**
   * Subscribe users to a topic
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Subscription response
   */
  static async subscribeToTopic(tokens, topic) {
    try {
      const admin = getFirebaseAdmin();
      
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      
      console.log('✅ Successfully subscribed to topic:', {
        topic: topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
      
    } catch (error) {
      console.error('❌ Topic subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe users from a topic
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Unsubscription response
   */
  static async unsubscribeFromTopic(tokens, topic) {
    try {
      const admin = getFirebaseAdmin();
      
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      
      console.log('✅ Successfully unsubscribed from topic:', {
        topic: topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
      
    } catch (error) {
      console.error('❌ Topic unsubscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper function to get failed tokens from multicast response
   * @param {Array<string>} tokens - Original tokens array
   * @param {Array<Object>} responses - Firebase responses array
   * @returns {Array<string>} - Array of failed tokens
   */
  static getFailedTokens(tokens, responses) {
    const failedTokens = [];
    responses.forEach((response, index) => {
      if (!response.success) {
        failedTokens.push(tokens[index]);
      }
    });
    return failedTokens;
  }

  /**
   * Validate FCM token format
   * @param {string} token - FCM token to validate
   * @returns {boolean} - True if token format is valid
   */
  static isValidToken(token) {
    // Basic validation for FCM token format
    return typeof token === 'string' && token.length > 140 && token.includes(':');
  }

  /**
   * Send plant tracking reminder notification
   * @param {string} token - FCM token
   * @param {Object} plantData - Plant and tracking data
   * @returns {Promise<Object>} - Notification response
   */
  static async sendPlantTrackingReminder(token, plantData) {
    const notification = {
      title: '🌱 पौधे की तस्वीर अपलोड करें',
      body: `${plantData.plantName} के लिए आज फोटो अपलोड करने का समय है। अपने पौधे की प्रगति ट्रैक करें।`,
      icon: '/icons/plant-icon.png'
    };

    const data = {
      type: 'plant_reminder',
      assignmentId: plantData.assignmentId.toString(),
      plantName: plantData.plantName,
      dueDate: plantData.dueDate,
      weekNumber: plantData.weekNumber.toString()
    };

    const options = {
      priority: 'high',
      sound: 'default',
      channelId: 'plant_tracking_channel',
      clickAction: 'OPEN_PLANT_TRACKING'
    };

    return await this.sendToDevice(token, notification, data, options);
  }

  /**
   * Send photo upload success notification
   * @param {string} token - FCM token
   * @param {Object} photoData - Photo upload data
   * @returns {Promise<Object>} - Notification response
   */
  static async sendPhotoUploadSuccess(token, photoData) {
    const notification = {
      title: '📸 फोटो सफलतापूर्वक अपलोड हुई',
      body: `${photoData.plantName} की फोटो अपलोड हो गई। आपकी प्रगति ${photoData.completionPercentage}% है।`,
      icon: '/icons/success-icon.png'
    };

    const data = {
      type: 'photo_success',
      assignmentId: photoData.assignmentId.toString(),
      photoId: photoData.photoId.toString(),
      completionPercentage: photoData.completionPercentage.toString()
    };

    return await this.sendToDevice(token, notification, data);
  }

  /**
   * Send general notification
   * @param {string} token - FCM token
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} customData - Custom data (optional)
   * @param {Object} options - Options (optional)
   * @returns {Promise<Object>} - Notification response
   */
  static async sendGeneralNotification(token, title, body, customData = {}, options = {}) {
    const notification = {
      title: title,
      body: body,
      icon: options.icon || '/icons/app-icon.png'
    };

    const data = {
      type: 'general',
      ...customData
    };

    return await this.sendToDevice(token, notification, data, options);
  }
}

module.exports = PushNotificationService;
