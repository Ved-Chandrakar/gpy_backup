const { PlantTrackingSchedule } = require('../models');

/**
 * Generate tracking schedule for a plant assignment
 * Schedule: 
 * - Month 1: Weekly uploads (4 times)
 * - Month 2: Bi-weekly uploads (2 times) 
 * - Month 3: Bi-weekly uploads (2 times)
 * Total: 8 scheduled uploads over 3 months
 */
const generateTrackingSchedule = async (assignmentId, assignedDate, transaction = null) => {
  const schedules = [];
  const startDate = new Date(assignedDate);
  
  // Month 1: Weekly uploads (weeks 1-4)
  for (let week = 1; week <= 4; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + (week * 7));
    
    schedules.push({
      assignment_id: assignmentId,
      week_number: week,
      month_number: 1,
      due_date: dueDate.toISOString().split('T')[0],
      upload_status: 'pending'
    });
  }
  
  // Month 2: Bi-weekly uploads (weeks 6, 8)
  for (let week = 1; week <= 2; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + (28 + (week * 14))); // Start from week 5 (28 days) + bi-weekly
    
    schedules.push({
      assignment_id: assignmentId,
      week_number: 4 + (week * 2), // weeks 6, 8
      month_number: 2,
      due_date: dueDate.toISOString().split('T')[0],
      upload_status: 'pending'
    });
  }
  
  // Month 3: Bi-weekly uploads (weeks 10, 12)
  for (let week = 1; week <= 2; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + (56 + (week * 14))); // Start from week 9 (56 days) + bi-weekly
    
    schedules.push({
      assignment_id: assignmentId,
      week_number: 8 + (week * 2), // weeks 10, 12
      month_number: 3,
      due_date: dueDate.toISOString().split('T')[0],
      upload_status: 'pending'
    });
  }
  
  // Create all schedule records
  const options = transaction ? { transaction } : {};
  await PlantTrackingSchedule.bulkCreate(schedules, options);
  return schedules;
};

/**
 * Update schedule status when photo is uploaded
 */
const updateScheduleOnPhotoUpload = async (assignmentId, photoId, uploadDate, remarks) => {
  // Find the next pending schedule for this assignment
  const nextSchedule = await PlantTrackingSchedule.findOne({
    where: {
      assignment_id: assignmentId,
      upload_status: 'pending'
    },
    order: [['due_date', 'ASC']]
  });
  
  if (nextSchedule) {
    await nextSchedule.update({
      upload_status: 'completed',
      photo_id: photoId,
      completed_date: uploadDate,
      remarks: remarks
    });
    return nextSchedule;
  }
  
  return null;
};

/**
 * Mark overdue schedules
 */
const markOverdueSchedules = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await PlantTrackingSchedule.update(
    { upload_status: 'overdue' },
    {
      where: {
        due_date: { [require('sequelize').Op.lt]: today },
        upload_status: 'pending'
      }
    }
  );
  
  return result[0]; // Number of affected rows
};

/**
 * Get tracking statistics for an assignment
 */
const getTrackingStats = async (assignmentId) => {
  const schedules = await PlantTrackingSchedule.findAll({
    where: { assignment_id: assignmentId },
    order: [['week_number', 'ASC']]
  });
  
  const stats = {
    total_schedules: schedules.length,
    completed: schedules.filter(s => s.upload_status === 'completed').length,
    pending: schedules.filter(s => s.upload_status === 'pending').length,
    overdue: schedules.filter(s => s.upload_status === 'overdue').length,
    next_due_date: null,
    days_remaining: null
  };
  
  // Find next pending schedule
  const nextPending = schedules.find(s => s.upload_status === 'pending');
  if (nextPending) {
    stats.next_due_date = nextPending.due_date;
    const today = new Date();
    const dueDate = new Date(nextPending.due_date);
    const diffTime = dueDate - today;
    stats.days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  return stats;
};

/**
 * Calculate completion percentage
 */
const getCompletionPercentage = (stats) => {
  if (stats.total_schedules === 0) return 0;
  return Math.round((stats.completed / stats.total_schedules) * 100);
};

module.exports = {
  generateTrackingSchedule,
  updateScheduleOnPhotoUpload,
  markOverdueSchedules,
  getTrackingStats,
  getCompletionPercentage
};
