const { Child, User, District, Block, Village, PlantAssignment, Plant, PlantPhoto, PlantTrackingSchedule } = require('../models');
const { validateRequest, schemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const { 
  generateTrackingSchedule, 
  updateScheduleOnPhotoUpload, 
  markOverdueSchedules, 
  getTrackingStats, 
  getCompletionPercentage 
} = require('../utils/plantTrackingUtils');
const PushNotificationService = require('../services/pushNotificationService');
const { getUserActiveFCMTokens } = require('./fcmController');
const { getFullPhotoUrl, processPhotoObject } = require('../utils/urlHelpers');

/**
 * Helper function to generate week titles based on month and week number
 */
const getWeekTitle = (monthNumber, weekNumber) => {
  if (monthNumber === 1) {
    return `Week ${weekNumber}`;
  } else if (monthNumber === 2) {
    // Month 2: weeks 6 and 8 become bi-weekly photos 1 and 2
    const biWeeklyNumber = weekNumber === 6 ? 1 : 2;
    return `Bi-weekly Photo ${biWeeklyNumber}`;
  } else if (monthNumber === 3) {
    // Month 3: weeks 10 and 12 become bi-weekly photos 1 and 2
    const biWeeklyNumber = weekNumber === 10 ? 1 : 2;
    return `Bi-weekly Photo ${biWeeklyNumber}`;
  }
  return `Week ${weekNumber}`;
};

const registerMother = async (req, res) => {
  try {
    const childData = {
      ...req.body,
      hospital_id: req.user.id
    };

    // Check if mother already exists (by mobile number)
    const existingChild = await Child.findOne({
      where: {
        mother_mobile: childData.mother_mobile,
        dob: childData.dob
      }
    });

    if (existingChild) {
      return res.status(400).json({
        success: false,
        message: 'Mother with this mobile number and child DOB already registered'
      });
    }

    // Create new child record
    const child = await Child.create(childData);

    // Fetch complete child data with associations
    const childWithDetails = await Child.findByPk(child.id, {
      include: [
        { model: User, as: 'hospital', attributes: ['name', 'hospital_name'] },
        { model: District, as: 'district', attributes: ['district_code', 'district_name'] },
        { model: Block, as: 'block', attributes: ['block_code', 'block_name'] },
        { model: Village, as: 'village', attributes: ['village_code', 'village_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Mother and child registered successfully',
      data: { child: childWithDetails }
    });
  } catch (error) {
    console.error('Register mother error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const getMothers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause = {};
    
    if (req.user.role.name === 'hospital') {
      whereClause.hospital_id = req.user.id;
    } else if (req.user.role.name === 'collector') {
      whereClause.district_id = req.user.district_id;
    } else if (req.user.role.name === 'mitanin') {
      whereClause.assigned_mitanin_id = req.user.id;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { mother_name: { [Op.like]: `%${search}%` } },
        { mother_mobile: { [Op.like]: `%${search}%` } },
        { child_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Child.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'hospital', attributes: ['name', 'hospital_name'] },
        { model: User, as: 'mitanin', attributes: ['name', 'mobile'] },
        { model: District, as: 'district', attributes: ['district_code', 'district_name'] },
        { model: Block, as: 'block', attributes: ['block_code', 'block_name'] },
        { model: Village, as: 'village', attributes: ['village_code', 'village_name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Mothers retrieved successfully',
      data: {
        mothers: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get mothers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMotherById = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findByPk(id, {
      include: [
        { model: User, as: 'hospital', attributes: ['name', 'hospital_name'] },
        { model: User, as: 'mitanin', attributes: ['name', 'mobile'] },
        { model: District, as: 'district', attributes: ['district_code', 'district_name'] },
        { model: Block, as: 'block', attributes: ['block_code', 'block_name'] },
        { model: Village, as: 'village', attributes: ['village_code', 'village_name'] },
        {
          model: PlantAssignment,
          as: 'plantAssignments',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species', 'category'] }
          ]
        }
      ]
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Mother not found'
      });
    }

    res.json({
      success: true,
      message: 'Mother details retrieved successfully',
      data: { child }
    });
  } catch (error) {
    console.error('Get mother by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMotherProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findByPk(id, {
      include: [
        {
          model: PlantAssignment,
          as: 'plantAssignments',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species', 'category'] },
            {
              model: PlantPhoto,
              as: 'photos',
              include: [
                { model: User, as: 'uploadedBy', attributes: ['name'] }
              ],
              order: [['upload_date', 'DESC']]
            }
          ]
        }
      ]
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Mother not found'
      });
    }

    res.json({
      success: true,
      message: 'Plant progress retrieved successfully',
      data: { progress: child.plantAssignments }
    });
  } catch (error) {
    console.error('Get mother progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMotherPlantTrackingList = async (req, res) => {
  try {
    // Mark overdue schedules first
    await markOverdueSchedules();

    // Get mother's mobile from authenticated user
    const motherMobile = req.user.mobile || req.user.userid;
    
    // Find mother's child - if multiple children exist for same mobile, get one with plant assignments
    let child = await Child.findOne({
      where: { mother_mobile: motherMobile },
      include: [{
        model: PlantAssignment,
        as: 'plantAssignments',
        where: { status: 'active' },
        required: true, // Only get children with active plant assignments
        include: [
          {
            model: Plant,
            as: 'plant',
            attributes: ['id', 'name', 'species', 'local_name']
          },
          {
            model: PlantTrackingSchedule,
            as: 'trackingSchedules',
            attributes: ['id', 'week_number', 'month_number', 'due_date', 'upload_status', 'completed_date']
          }
        ]
      }]
    });

    // If no child found with active assignments, try to find any child for this mother
    if (!child) {
      child = await Child.findOne({
        where: { mother_mobile: motherMobile },
        include: [{
          model: PlantAssignment,
          as: 'plantAssignments',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: Plant,
              as: 'plant',
              attributes: ['id', 'name', 'species', 'local_name']
            },
            {
              model: PlantTrackingSchedule,
              as: 'trackingSchedules',
              attributes: ['id', 'week_number', 'month_number', 'due_date', 'upload_status', 'completed_date']
            }
          ]
        }]
      });
    }

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Mother not found'
      });
    }

    // Filter active plant assignments (since we used required: false)
    const activeAssignments = child.plantAssignments?.filter(assignment => 
      assignment && assignment.status === 'active'
    ) || [];

    // Process each plant assignment to get detailed tracking stats
    const plantTrackingList = await Promise.all(
      activeAssignments.map(async (assignment) => {
        const stats = await getTrackingStats(assignment.id);
        const completionPercentage = getCompletionPercentage(stats);
        
        // Get detailed schedule breakdown
        const schedules = await PlantTrackingSchedule.findAll({
          where: { assignment_id: assignment.id },
          order: [['week_number', 'ASC']]
        });
        
        // Calculate progress details
        const progressDetails = {
          month1_progress: {
            total_required: 4, // Weekly for 4 weeks
            uploaded: schedules.filter(s => s.month_number === 1 && s.upload_status === 'completed').length,
            pending: schedules.filter(s => s.month_number === 1 && s.upload_status === 'pending').length,
            overdue: schedules.filter(s => s.month_number === 1 && s.upload_status === 'overdue').length
          },
          month2_progress: {
            total_required: 2, // Bi-weekly for 2 uploads
            uploaded: schedules.filter(s => s.month_number === 2 && s.upload_status === 'completed').length,
            pending: schedules.filter(s => s.month_number === 2 && s.upload_status === 'pending').length,
            overdue: schedules.filter(s => s.month_number === 2 && s.upload_status === 'overdue').length
          },
          month3_progress: {
            total_required: 2, // Bi-weekly for 2 uploads
            uploaded: schedules.filter(s => s.month_number === 3 && s.upload_status === 'completed').length,
            pending: schedules.filter(s => s.month_number === 3 && s.upload_status === 'pending').length,
            overdue: schedules.filter(s => s.month_number === 3 && s.upload_status === 'overdue').length
          }
        };
        
        // Find next due upload
        const nextPendingSchedule = schedules.find(s => s.upload_status === 'pending');
        let nextDueInfo = null;
        if (nextPendingSchedule) {
          const today = new Date();
          const dueDate = new Date(nextPendingSchedule.due_date);
          const diffTime = dueDate - today;
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          nextDueInfo = {
            due_date: nextPendingSchedule.due_date,
            week_number: nextPendingSchedule.week_number,
            month_number: nextPendingSchedule.month_number,
            days_remaining: daysRemaining,
            is_overdue: daysRemaining < 0
          };
        }
        
        return {
          assignment_id: assignment.id,
          plant: {
            id: assignment.plant.id,
            name: assignment.plant.name,
            species: assignment.plant.species,
            local_name: assignment.plant.local_name
          },
          assigned_date: assignment.assigned_date,
          
          // Overall progress summary
          overall_progress: {
            total_photos_required: 8, // 4 + 2 + 2
            photos_uploaded: stats.completed,
            photos_pending: stats.pending,
            photos_overdue: stats.overdue,
            completion_percentage: completionPercentage
          },
          
          // Month-wise detailed progress
          detailed_progress: progressDetails,
          
          // Next upload information
          next_upload: nextDueInfo,
          
          // Upload schedule explanation
          schedule_info: {
            month1: "Weekly photos (4 uploads in first month)",
            month2: "Bi-weekly photos (2 uploads in second month)", 
            month3: "Bi-weekly photos (2 uploads in third month)",
            total_duration: "3 months tracking period"
          },
          
          status: assignment.status
        };
      })
    );

    // Calculate overall summary
    const totalPhotosRequired = plantTrackingList.length * 8;
    const totalPhotosUploaded = plantTrackingList.reduce((sum, plant) => sum + plant.overall_progress.photos_uploaded, 0);
    const totalPhotosPending = plantTrackingList.reduce((sum, plant) => sum + plant.overall_progress.photos_pending, 0);
    const totalPhotosOverdue = plantTrackingList.reduce((sum, plant) => sum + plant.overall_progress.photos_overdue, 0);

    res.json({
      success: true,
      message: 'Plant tracking list retrieved successfully',
      data: {
        mother_name: child.mother_name, // Only mother name, no child name
        
        // Plant summary
        plant_summary: {
          total_plants_assigned: plantTrackingList.length,
          plants: plantTrackingList
        },
        
        // Overall progress across all plants
        overall_summary: {
          total_photos_required: totalPhotosRequired,
          total_photos_uploaded: totalPhotosUploaded,
          total_photos_pending: totalPhotosPending,
          total_photos_overdue: totalPhotosOverdue,
          overall_completion_percentage: totalPhotosRequired > 0 ? Math.round((totalPhotosUploaded / totalPhotosRequired) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get mother plant tracking list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMotherPlantTrackingDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const motherMobile = req.user.mobile || req.user.userid;

    // Verify assignment belongs to this mother
    const assignment = await PlantAssignment.findOne({
      where: { id: assignmentId },
      include: [
        {
          model: Child,
          as: 'child',
          where: { mother_mobile: motherMobile },
          attributes: ['id', 'child_name', 'mother_name', 'mother_mobile']
        },
        {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name', 'species', 'local_name', 'description', 'care_instructions']
        },
        {
          model: PlantTrackingSchedule,
          as: 'trackingSchedules',
          include: [{
            model: PlantPhoto,
            as: 'photo',
            attributes: ['id', 'photo_url', 'latitude', 'longitude', 'upload_date', 'notes'],
            required: false
          }]
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Plant assignment not found or does not belong to this mother'
      });
    }

    // Get overall stats
    const stats = await getTrackingStats(assignmentId);
    const completionPercentage = getCompletionPercentage(stats);

    // Sort tracking schedules by month and week number
    assignment.trackingSchedules.sort((a, b) => {
      if (a.month_number !== b.month_number) {
        return a.month_number - b.month_number;
      }
      return a.week_number - b.week_number;
    });

    // Format tracking history month-wise
    const trackingHistoryMonthWise = {
      month1: {
        title: "1st Month - Weekly Photos (4 uploads)",
        description: "Weekly photos for first month",
        weeks: []
      },
      month2: {
        title: "2nd Month - Bi-weekly Photos (2 uploads)", 
        description: "Bi-weekly photos for second month",
        weeks: []
      },
      month3: {
        title: "3rd Month - Bi-weekly Photos (2 uploads)",
        description: "Bi-weekly photos for third month", 
        weeks: []
      }
    };

    // Group schedules by month and format them
    assignment.trackingSchedules.forEach(schedule => {
      const weekData = {
        schedule_id: schedule.id,
        week_number: schedule.week_number,
        week_title: getWeekTitle(schedule.month_number, schedule.week_number),
        due_date: schedule.due_date,
        assigned_date: assignment.assigned_date,
        upload_status: schedule.upload_status,
        completed_date: schedule.completed_date,
        uploaded_date: schedule.photo ? schedule.photo.upload_date : null,
        remarks: schedule.remarks,
        photo: schedule.photo ? {
          id: schedule.photo.id,
          photo_url: getFullPhotoUrl(schedule.photo.photo_url, req),
          latitude: schedule.photo.latitude,
          longitude: schedule.photo.longitude,
          upload_date: schedule.photo.upload_date,
          remarks: schedule.photo.notes
        } : null
      };

      // Add to appropriate month
      if (schedule.month_number === 1) {
        trackingHistoryMonthWise.month1.weeks.push(weekData);
      } else if (schedule.month_number === 2) {
        trackingHistoryMonthWise.month2.weeks.push(weekData);
      } else if (schedule.month_number === 3) {
        trackingHistoryMonthWise.month3.weeks.push(weekData);
      }
    });

    // Also keep the flat tracking history for backward compatibility
    const trackingHistory = assignment.trackingSchedules.map(schedule => ({
      schedule_id: schedule.id,
      week_number: schedule.week_number,
      month_number: schedule.month_number,
      due_date: schedule.due_date,
      upload_status: schedule.upload_status,
      completed_date: schedule.completed_date,
      remarks: schedule.remarks,
      photo: schedule.photo ? {
        id: schedule.photo.id,
        photo_url: getFullPhotoUrl(schedule.photo.photo_url, req),
        latitude: schedule.photo.latitude,
        longitude: schedule.photo.longitude,
        upload_date: schedule.photo.upload_date,
        remarks: schedule.photo.notes
      } : null
    }));

    res.json({
      success: true,
      message: 'Plant tracking details retrieved successfully',
      data: {
        assignment: {
          id: assignment.id,
          assigned_date: assignment.assigned_date,
          status: assignment.status,
          plant: assignment.plant,
          child: assignment.child
        },
        stats: {
          total_schedules: stats.total_schedules,
          completed: stats.completed,
          pending: stats.pending,
          overdue: stats.overdue,
          completion_percentage: completionPercentage,
          next_due_date: stats.next_due_date,
          days_remaining: stats.days_remaining
        },
        tracking_history: trackingHistory,
        tracking_history_monthwise: trackingHistoryMonthWise
      }
    });

  } catch (error) {
    console.error('Get mother plant tracking details error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const uploadMotherPlantPhoto = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { latitude, longitude, remarks } = req.body;
    const motherMobile = req.user.mobile || req.user.userid;

    // Verify assignment belongs to this mother
    const assignment = await PlantAssignment.findOne({
      where: { id: assignmentId },
      include: [{
        model: Child,
        as: 'child',
        where: { mother_mobile: motherMobile }
      }]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Plant assignment not found or does not belong to this mother'
      });
    }

    // Check if there's a file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required'
      });
    }

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Calculate week number since assignment
    const assignmentDate = new Date(assignment.assigned_date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - assignmentDate);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    // Create photo record
    const photo = await PlantPhoto.create({
      assignment_id: assignmentId,
      photo_url: req.file.path || req.file.filename,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      notes: remarks || '',
      uploaded_by: req.user.id,
      upload_date: new Date(),
      week_number: diffWeeks,
      growth_stage: 'seedling', // Default, can be enhanced later
      health_status: 'healthy'  // Default, can be enhanced later
    });

    // Update tracking schedule
    const updatedSchedule = await updateScheduleOnPhotoUpload(
      assignmentId, 
      photo.id, 
      photo.upload_date, 
      remarks
    );

    // Get updated stats
    const stats = await getTrackingStats(assignmentId);
    const completionPercentage = getCompletionPercentage(stats);

    // Send push notification for successful photo upload
    try {
      const userTokens = await getUserActiveFCMTokens(req.user.id);
      if (userTokens.length > 0) {
        const plantName = assignment.plant?.name || 'पौधा';
        const photoData = {
          assignmentId: assignmentId,
          plantName: plantName,
          photoId: photo.id,
          completionPercentage: completionPercentage
        };

        // Send notification to all user's devices
        for (const token of userTokens) {
          await PushNotificationService.sendPhotoUploadSuccess(token, photoData);
        }
      }
    } catch (notificationError) {
      console.error('Push notification error:', notificationError);
      // Don't fail the photo upload if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo: {
          id: photo.id,
          photo_url: getFullPhotoUrl(photo.photo_url, req),
          latitude: photo.latitude,
          longitude: photo.longitude,
          upload_date: photo.upload_date,
          remarks: photo.notes
        },
        updated_schedule: updatedSchedule ? {
          schedule_id: updatedSchedule.id,
          week_number: updatedSchedule.week_number,
          month_number: updatedSchedule.month_number,
          status: updatedSchedule.upload_status
        } : null,
        tracking_stats: stats
      }
    });

  } catch (error) {
    console.error('Upload mother plant photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerMother: [validateRequest(schemas.childRegistration), registerMother],
  getMothers,
  getMotherById,
  getMotherProgress,
  // New mother tracking APIs
  getMotherPlantTrackingList,
  getMotherPlantTrackingDetails,
  uploadMotherPlantPhoto
};
