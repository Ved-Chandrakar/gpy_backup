const cron = require('node-cron');
const { PlantAssignment, PlantPhoto, Child, User } = require('../models');
const { Op } = require('sequelize');
const { isPhotoOverdue } = require('../utils/helpers');

/**
 * Send reminder notifications for overdue photo uploads
 */
const sendPhotoReminders = async () => {
  try {
    console.log('🔔 Running photo reminder check...');

    // Get all active plant assignments
    const assignments = await PlantAssignment.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Child,
          as: 'child',
          include: [
            { model: User, as: 'mitanin', attributes: ['name', 'mobile'] }
          ]
        },
        {
          model: PlantPhoto,
          as: 'photos',
          attributes: ['upload_date'],
          order: [['upload_date', 'DESC']],
          limit: 1
        }
      ]
    });

    const overdueAssignments = [];

    for (const assignment of assignments) {
      const lastPhotoDate = assignment.photos.length > 0 ? 
        assignment.photos[0].upload_date : null;

      if (isPhotoOverdue(assignment.assigned_date, lastPhotoDate)) {
        overdueAssignments.push({
          assignment_id: assignment.id,
          mother_name: assignment.child.mother_name,
          mother_mobile: assignment.child.mother_mobile,
          mitanin_name: assignment.child.mitanin?.name,
          mitanin_mobile: assignment.child.mitanin?.mobile,
          days_overdue: Math.ceil(
            (new Date() - new Date(lastPhotoDate || assignment.assigned_date)) / (1000 * 60 * 60 * 24)
          )
        });
      }
    }

    if (overdueAssignments.length > 0) {
      console.log(`📱 Found ${overdueAssignments.length} overdue photo uploads`);
      
      // In a real application, you would send SMS/WhatsApp messages here
      // For now, we'll just log the reminders
      overdueAssignments.forEach(reminder => {
        console.log(`📋 Reminder: ${reminder.mother_name} (${reminder.mother_mobile}) - ${reminder.days_overdue} days overdue`);
      });
    } else {
      console.log('✅ No overdue photo uploads found');
    }

  } catch (error) {
    console.error('❌ Error in photo reminder check:', error);
  }
};

/**
 * Generate daily statistics report
 */
const generateDailyReport = async () => {
  try {
    console.log('📊 Generating daily statistics report...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get daily statistics
    const todayStats = {
      new_registrations: await Child.count({
        where: {
          created_at: {
            [Op.gte]: yesterday.toISOString().split('T')[0],
            [Op.lt]: today.toISOString().split('T')[0]
          }
        }
      }),
      photos_uploaded: await PlantPhoto.count({
        where: {
          upload_date: {
            [Op.gte]: yesterday.toISOString().split('T')[0],
            [Op.lt]: today.toISOString().split('T')[0]
          }
        }
      }),
      total_active_assignments: await PlantAssignment.count({
        where: { status: 'active' }
      })
    };

    console.log('📈 Daily Report:', todayStats);

  } catch (error) {
    console.error('❌ Error generating daily report:', error);
  }
};

/**
 * Initialize cron jobs
 */
const initializeCronJobs = () => {
  console.log('⏰ Initializing cron jobs...');

  // Daily reminder check at 9 AM
  cron.schedule(process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *', () => {
    sendPhotoReminders();
  });

  // Daily report at 11 PM
  cron.schedule('0 23 * * *', () => {
    generateDailyReport();
  });

  console.log('✅ Cron jobs initialized successfully');
};

module.exports = {
  sendPhotoReminders,
  generateDailyReport,
  initializeCronJobs
};
