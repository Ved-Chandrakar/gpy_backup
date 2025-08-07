const { PlantPhoto, PlantAssignment, Plant, Child, User } = require('../models');
const { validateRequest, schemas } = require('../middleware/validation');
const upload = require('../config/multer');
const path = require('path');
const { getFullPhotoUrl, processPhotoObject } = require('../utils/urlHelpers');

const uploadPlantPhoto = async (req, res) => {
  try {
    const { assignment_id, latitude, longitude, growth_stage, health_status, notes } = req.body;

    // Check if assignment exists and belongs to user
    const assignment = await PlantAssignment.findByPk(assignment_id, {
      include: [
        { model: Child, as: 'child' },
        { model: Plant, as: 'plant' }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Plant assignment not found'
      });
    }

    // Check if user has permission to upload photo
    const userRole = req.user.role.name;
    if (userRole === 'mitanin' && assignment.child.assigned_mitanin_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload photos for your assigned children'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required'
      });
    }

    // Calculate week number since assignment
    const assignmentDate = new Date(assignment.assigned_date);
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate - assignmentDate) / (7 * 24 * 60 * 60 * 1000));

    // Create photo record
    const photo = await PlantPhoto.create({
      assignment_id,
      photo_url: req.file.filename,
      latitude: latitude || null,
      longitude: longitude || null,
      growth_stage,
      health_status,
      notes,
      uploaded_by: req.user.id,
      week_number
    });

    // Fetch complete photo data
    const completePhoto = await PlantPhoto.findByPk(photo.id, {
      include: [
        {
          model: PlantAssignment,
          as: 'assignment',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species'] },
            { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
          ]
        },
        { model: User, as: 'uploadedBy', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photo: completePhoto }
    });
  } catch (error) {
    console.error('Upload plant photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during photo upload'
    });
  }
};

const getPlantPhotos = async (req, res) => {
  try {
    const { assignment_id, child_id } = req.query;

    let whereClause = {};
    let includeClause = [
      {
        model: PlantAssignment,
        as: 'assignment',
        include: [
          { model: Plant, as: 'plant', attributes: ['name', 'species'] },
          { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
        ]
      },
      { model: User, as: 'uploadedBy', attributes: ['name'] }
    ];

    if (assignment_id) {
      whereClause.assignment_id = assignment_id;
    }

    if (child_id) {
      includeClause[0].where = { child_id };
    }

    // Filter based on user role
    if (req.user.role.name === 'mitanin') {
      includeClause[0].include[1].where = { assigned_mitanin_id: req.user.id };
    }

    const photos = await PlantPhoto.findAll({
      where: whereClause,
      include: includeClause,
      order: [['upload_date', 'DESC']]
    });

    // Process photos to include full URLs
    const photosWithFullUrls = photos.map(photo => ({
      ...photo.toJSON(),
      photo_url: getFullPhotoUrl(photo.photo_url, req)
    }));

    res.json({
      success: true,
      message: 'Photos retrieved successfully',
      data: { photos: photosWithFullUrls }
    });
  } catch (error) {
    console.error('Get plant photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getPlantPhotoById = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await PlantPhoto.findByPk(id, {
      include: [
        {
          model: PlantAssignment,
          as: 'assignment',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species'] },
            { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
          ]
        },
        { model: User, as: 'uploadedBy', attributes: ['name'] }
      ]
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Process photo to include full URL
    const photoWithFullUrl = {
      ...photo.toJSON(),
      photo_url: getFullPhotoUrl(photo.photo_url, req)
    };

    res.json({
      success: true,
      message: 'Photo retrieved successfully',
      data: { photo: photoWithFullUrl }
    });
  } catch (error) {
    console.error('Get plant photo by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  uploadPlantPhoto: [
    upload.single('photo'),
    validateRequest(schemas.plantPhotoUpload),
    uploadPlantPhoto
  ],
  getPlantPhotos,
  getPlantPhotoById
};
