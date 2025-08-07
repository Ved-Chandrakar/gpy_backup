const moment = require('moment');

/**
 * Calculate expected photo upload dates for a child
 */
const calculatePhotoSchedule = (assignmentDate) => {
  const schedule = [];
  const startDate = moment(assignmentDate);
  
  // First month: weekly photos (4 weeks)
  for (let week = 1; week <= 4; week++) {
    schedule.push({
      week: week,
      expected_date: startDate.clone().add(week, 'weeks').toDate(),
      frequency: 'weekly'
    });
  }
  
  // Next two months: bi-weekly photos (4 times)
  for (let period = 1; period <= 4; period++) {
    const week = 4 + (period * 2);
    schedule.push({
      week: week,
      expected_date: startDate.clone().add(week, 'weeks').toDate(),
      frequency: 'bi-weekly'
    });
  }
  
  return schedule;
};

/**
 * Get current expected photo week
 */
const getCurrentPhotoWeek = (assignmentDate) => {
  const startDate = moment(assignmentDate);
  const currentDate = moment();
  const weeksElapsed = currentDate.diff(startDate, 'weeks');
  
  return Math.max(1, weeksElapsed + 1);
};

/**
 * Check if photo is overdue
 */
const isPhotoOverdue = (assignmentDate, lastPhotoDate) => {
  const schedule = calculatePhotoSchedule(assignmentDate);
  const currentWeek = getCurrentPhotoWeek(assignmentDate);
  
  if (!lastPhotoDate) {
    return currentWeek > 1;
  }
  
  const lastPhotoWeek = moment(lastPhotoDate).diff(moment(assignmentDate), 'weeks') + 1;
  return currentWeek > lastPhotoWeek + 1;
};

/**
 * Format Indian mobile number
 */
const formatMobileNumber = (mobile) => {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return mobile;
};

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

module.exports = {
  calculatePhotoSchedule,
  getCurrentPhotoWeek,
  isPhotoOverdue,
  formatMobileNumber,
  generateUniqueFilename
};
