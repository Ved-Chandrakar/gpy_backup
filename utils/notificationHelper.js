const PushNotificationService = require('../services/pushNotificationService');
const { getUserActiveFCMTokens } = require('../controllers/fcmController');
const { PlantAssignment, Plant, Child, PlantTrackingSchedule, User } = require('../models');

/**
 * Notification Helper Functions
 * These functions can be called from anywhere in the application
 */
class NotificationHelper {

  /**
   * Send plant tracking reminder to a specific user
   * @param {number} userId - User ID
   * @param {number} assignmentId - Plant assignment ID
   * @param {Object} scheduleData - Schedule data (optional, will fetch if not provided)
   * @returns {Promise<Object>} - Notification result
   */
  static async sendPlantTrackingReminder(userId, assignmentId, scheduleData = null) {
    try {
      // Get user's active FCM tokens
      const userTokens = await getUserActiveFCMTokens(userId);
      if (userTokens.length === 0) {
        console.log(`No active FCM tokens found for user ${userId}`);
        return { success: false, message: 'No active tokens found' };
      }

      // Get plant assignment details if not provided
      let plantData = scheduleData;
      if (!plantData) {
        const assignment = await PlantAssignment.findByPk(assignmentId, {
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'local_name'] },
            { model: Child, as: 'child', attributes: ['child_name'] }
          ]
        });

        if (!assignment) {
          throw new Error('Plant assignment not found');
        }

        // Get next pending schedule
        const nextSchedule = await PlantTrackingSchedule.findOne({
          where: {
            assignment_id: assignmentId,
            upload_status: 'pending'
          },
          order: [['due_date', 'ASC']]
        });

        if (!nextSchedule) {
          console.log(`No pending schedules found for assignment ${assignmentId}`);
          return { success: false, message: 'No pending schedules' };
        }

        plantData = {
          assignmentId: assignmentId,
          plantName: assignment.plant?.local_name || assignment.plant?.name || 'पौधा',
          childName: assignment.child?.child_name || '',
          dueDate: nextSchedule.due_date,
          weekNumber: nextSchedule.week_number
        };
      }

      const results = [];

      // Send notification to all user's devices
      for (const token of userTokens) {
        const result = await PushNotificationService.sendPlantTrackingReminder(token, plantData);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ Plant tracking reminder sent to ${successCount}/${userTokens.length} devices for user ${userId}`);
      
      return {
        success: true,
        message: `Reminder sent to ${successCount} devices`,
        results: results
      };

    } catch (error) {
      console.error('Send plant tracking reminder error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Send plant tracking reminders to multiple users
   * @param {Array<Object>} userAssignments - Array of {userId, assignmentId} objects
   * @returns {Promise<Object>} - Bulk notification result
   */
  static async sendBulkPlantTrackingReminders(userAssignments) {
    try {
      const results = [];

      for (const { userId, assignmentId } of userAssignments) {
        const result = await this.sendPlantTrackingReminder(userId, assignmentId);
        results.push({
          userId,
          assignmentId,
          ...result
        });
      }

      const successCount = results.filter(r => r.success).length;

      console.log(`✅ Bulk reminders: ${successCount}/${userAssignments.length} successful`);

      return {
        success: true,
        message: `Bulk reminders sent: ${successCount}/${userAssignments.length} successful`,
        total: userAssignments.length,
        successful: successCount,
        failed: userAssignments.length - successCount,
        results: results
      };

    } catch (error) {
      console.error('Send bulk reminders error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Send custom notification to a user
   * @param {number} userId - User ID
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data (optional)
   * @param {Object} options - Notification options (optional)
   * @returns {Promise<Object>} - Notification result
   */
  static async sendCustomNotification(userId, title, body, data = {}, options = {}) {
    try {
      const userTokens = await getUserActiveFCMTokens(userId);
      if (userTokens.length === 0) {
        return { success: false, message: 'No active tokens found' };
      }

      const results = [];

      for (const token of userTokens) {
        const result = await PushNotificationService.sendGeneralNotification(
          token, 
          title, 
          body, 
          data, 
          options
        );
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;

      return {
        success: true,
        message: `Notification sent to ${successCount} devices`,
        results: results
      };

    } catch (error) {
      console.error('Send custom notification error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Send notification to all users in a specific role
   * @param {string} roleName - Role name (e.g., 'mother', 'hospital', 'admin')
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data (optional)
   * @param {Object} options - Notification options (optional)
   * @returns {Promise<Object>} - Broadcast result
   */
  static async sendRoleBroadcast(roleName, title, body, data = {}, options = {}) {
    try {
      // Get all users with the specified role
      const users = await User.findAll({
        include: [{
          model: require('../models').Role,
          as: 'role',
          where: { name: roleName }
        }],
        attributes: ['id', 'mobile']
      });

      if (users.length === 0) {
        return { success: false, message: `No users found with role ${roleName}` };
      }

      const results = [];

      for (const user of users) {
        const result = await this.sendCustomNotification(user.id, title, body, data, options);
        results.push({
          userId: user.id,
          mobile: user.mobile,
          ...result
        });
      }

      const successCount = results.filter(r => r.success).length;

      console.log(`✅ Role broadcast to ${roleName}: ${successCount}/${users.length} successful`);

      return {
        success: true,
        message: `Broadcast sent to ${successCount}/${users.length} users`,
        role: roleName,
        total: users.length,
        successful: successCount,
        failed: users.length - successCount,
        results: results
      };

    } catch (error) {
      console.error('Send role broadcast error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Send overdue plant tracking notifications
   * This function can be called from cron jobs
   * @returns {Promise<Object>} - Overdue notification result
   */
  static async sendOverdueTrackingNotifications() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Find all overdue schedules
      const overdueSchedules = await PlantTrackingSchedule.findAll({
        where: {
          due_date: { [require('sequelize').Op.lt]: today },
          upload_status: 'pending'
        },
        include: [{
          model: PlantAssignment,
          as: 'assignment',
          include: [
            { model: Plant, as: 'plant' },
            { 
              model: Child, 
              as: 'child',
              include: [{
                model: User,
                as: 'mother',
                where: { mobile: require('sequelize').col('child.mother_mobile') }
              }]
            }
          ]
        }]
      });

      if (overdueSchedules.length === 0) {
        return { success: true, message: 'No overdue schedules found' };
      }

      const results = [];

      for (const schedule of overdueSchedules) {
        const assignment = schedule.assignment;
        const plant = assignment.plant;
        const child = assignment.child;
        const mother = child.mother;

        if (mother) {
          const plantData = {
            assignmentId: assignment.id,
            plantName: plant?.local_name || plant?.name || 'पौधा',
            childName: child.child_name,
            dueDate: schedule.due_date,
            weekNumber: schedule.week_number
          };

          const title = '⚠️ पौधे की तस्वीर लेट है';
          const body = `${plantData.plantName} की फोटो ${schedule.due_date} को अपलोड करनी थी। कृपया जल्दी अपलोड करें।`;

          const result = await this.sendCustomNotification(
            mother.id,
            title,
            body,
            {
              type: 'overdue_reminder',
              assignmentId: assignment.id.toString(),
              scheduleId: schedule.id.toString(),
              dueDate: schedule.due_date
            },
            { priority: 'high', sound: 'default' }
          );

          results.push({
            userId: mother.id,
            assignmentId: assignment.id,
            scheduleId: schedule.id,
            ...result
          });
        }
      }

      const successCount = results.filter(r => r.success).length;

      console.log(`✅ Overdue notifications: ${successCount}/${overdueSchedules.length} successful`);

      return {
        success: true,
        message: `Overdue notifications sent: ${successCount}/${overdueSchedules.length}`,
        total: overdueSchedules.length,
        successful: successCount,
        results: results
      };

    } catch (error) {
      console.error('Send overdue notifications error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }
}

module.exports = NotificationHelper;
