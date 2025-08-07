const { User, PlantPhoto, PlantAssignment, Child, Plant, Role, District, Block, Village } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { get } = require('../routes/admin');

/**
 * Get mitanin dashboard data
 * Shows only 2 counters: total_pending_verification and total_verification_photos
 */
const getDashboard = async (req, res) => {
  try {
    const mitaninId = req.user.id;
    const hospitalId = req.user.hospital_id;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Mitanin must be assigned to a hospital'
      });
    }

    // Get total pending verification photos for mothers from the same hospital
    const totalPendingVerification = await PlantPhoto.count({
      where: {
        is_verified: false
      },
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        required: true,
        include: [{
          model: Child,
          as: 'child',
          required: true,
          where: {
            hospital_id: hospitalId
          }
        }]
      }]
    });

    // Get total verification photos uploaded by mothers from the same hospital
    const totalVerificationPhotos = await PlantPhoto.count({
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        required: true,
        include: [{
          model: Child,
          as: 'child',
          required: true,
          where: {
            hospital_id: hospitalId
          }
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Mitanin dashboard data retrieved successfully',
      data: {
        counters: {
          total_pending_verification: totalPendingVerification,
          total_verification_photos: totalVerificationPhotos
        },
        hospital_id: hospitalId,
        mitanin_info: {
          id: req.user.id,
          name: req.user.name,
          userid: req.user.userid
        }
      }
    });

  } catch (error) {
    console.error('Mitanin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get pending verification photos for mitanin
 */
const getPendingVerificationPhotos = async (req, res) => {
  try {
    const mitaninId = req.user.id;
    const hospitalId = req.user.hospital_id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Mitanin must be assigned to a hospital'
      });
    }

    // Get pending verification photos
    const { count, rows: photos } = await PlantPhoto.findAndCountAll({
      where: {
        is_verified: false
      },
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        required: true,
        include: [{
          model: Child,
          as: 'child',
          required: true,
          where: {
            hospital_id: hospitalId
          },
          attributes: ['id', 'child_name', 'mother_name', 'mother_mobile', 'dob']
        }, {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name']
        }]
      }, {
        model: User,
        as: 'uploadedBy',
        attributes: ['id', 'name', 'userid']
      }],
      order: [['upload_date', 'DESC']],
      limit,
      offset
    });

    // Process photos to include full URLs
    const { getFullPhotoUrl } = require('../utils/urlHelpers');
    const processedPhotos = photos.map(photo => {
      const photoData = photo.toJSON();
      return {
        ...photoData,
        photo_url: getFullPhotoUrl(photoData.photo_url, req),
        full_url: getFullPhotoUrl(photoData.photo_url, req)
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Pending verification photos retrieved successfully',
      data: {
        photos: processedPhotos,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: count,
          per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get pending verification photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending verification photos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify a plant photo
 */
const verifyPhoto = async (req, res) => {
  try {
    const mitaninId = req.user.id;
    const hospitalId = req.user.hospital_id;
    const { photo_id } = req.params;
    const { verification_status, verification_remarks, notes } = req.body;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Mitanin must be assigned to a hospital'
      });
    }

    if (!['verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Verification status must be either "verified" or "rejected"'
      });
    }

    // Require verification remarks for rejected photos
    if (verification_status === 'rejected' && !verification_remarks && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Verification remarks are required when rejecting a photo'
      });
    }

    // Find the photo and verify it belongs to the same hospital
    const photo = await PlantPhoto.findOne({
      where: { id: photo_id },
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        required: true,
        include: [{
          model: Child,
          as: 'child',
          required: true,
          where: {
            hospital_id: hospitalId
          }
        }]
      }]
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or not accessible'
      });
    }

    // Update photo verification status
    const finalRemarks = verification_remarks || notes || '';
    await photo.update({
      is_verified: verification_status === 'verified',
      notes: finalRemarks,
      verified_by: mitaninId,
      verified_at: new Date(),
      updated_at: new Date()
    });

    // Get updated photo data
    const updatedPhoto = await PlantPhoto.findOne({
      where: { id: photo_id },
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        include: [{
          model: Child,
          as: 'child',
          attributes: ['id', 'child_name', 'mother_name', 'mother_mobile']
        }, {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name']
        }]
      }, {
        model: User,
        as: 'uploadedBy',
        attributes: ['id', 'name', 'userid']
      }]
    });

    // Process photo to include full URL
    const { getFullPhotoUrl } = require('../utils/urlHelpers');
    const photoData = updatedPhoto.toJSON();
    photoData.photo_url = getFullPhotoUrl(photoData.photo_url, req);
    photoData.full_url = getFullPhotoUrl(photoData.photo_url, req);

    res.json({
      success: true,
      message: `Photo ${verification_status} successfully`,
      data: {
        photo: photoData,
        verification_status,
        verification_remarks: finalRemarks,
        verified_by: {
          id: mitaninId,
          name: req.user.name,
          userid: req.user.userid
        },
        verified_at: updatedPhoto.verified_at || new Date()
      }
    });

  } catch (error) {
    console.error('Verify photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all verification photos (verified and pending) for mitanin
 */
const getAllVerificationPhotos = async (req, res) => {
  try {
    const mitaninId = req.user.id;
    const hospitalId = req.user.hospital_id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;
    const status = req.query.status; // 'verified', 'pending', or null for all

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Mitanin must be assigned to a hospital'
      });
    }

    let whereClause = {};
    if (status === 'verified') {
      whereClause.is_verified = true;
    } else if (status === 'pending') {
      whereClause.is_verified = false;
    }

    // Get verification photos
    const { count, rows: photos } = await PlantPhoto.findAndCountAll({
      where: whereClause,
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        required: true,
        include: [{
          model: Child,
          as: 'child',
          required: true,
          where: {
            hospital_id: hospitalId
          },
          attributes: ['id', 'child_name', 'mother_name', 'mother_mobile', 'dob']
        }, {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name']
        }]
      }, {
        model: User,
        as: 'uploadedBy',
        attributes: ['id', 'name', 'userid']
      }],
      order: [['upload_date', 'DESC']],
      limit,
      offset
    });

    // Process photos to include full URLs
    const { getFullPhotoUrl } = require('../utils/urlHelpers');
    const processedPhotos = photos.map(photo => {
      const photoData = photo.toJSON();
      return {
        ...photoData,
        photo_url: getFullPhotoUrl(photoData.photo_url, req),
        full_url: getFullPhotoUrl(photoData.photo_url, req)
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Verification photos retrieved successfully',
      data: {
        photos: processedPhotos,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: count,
          per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        },
        filter: status || 'all'
      }
    });

  } catch (error) {
    console.error('Get all verification photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching verification photos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getMothersList = async (req, res) => {
  try {
    console.log(`Mothers list requested by hospital user: ${req.user.hospital_id}`);

    const {
      page = 1,
      limit = 10,
      search = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const offset = (pageNum - 1) * limitNum;

    // Build search conditions
    const searchConditions = {
      hospital_id: req.user.hospital_id // Only mothers registered by this hospital
    };

    // Add search filter if provided
    let searchWhere = {};
    if (search.trim()) {
      searchWhere = {
        [Op.or]: [
          { mother_name: { [Op.like]: `%${search}%` } },
          { mother_mobile: { [Op.like]: `%${search}%` } },
          { child_name: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // Get mothers with location details
    const { count, rows: mothers } = await Child.findAndCountAll({
      where: {
        ...searchConditions,
        ...searchWhere
      },
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['district_code', 'district_name', 'lgd_district_code']
        },
        {
          model: Block,
          as: 'block',
          attributes: ['block_code', 'block_name', 'lgd_block_code']
        },
        {
          model: Village,
          as: 'village',
          attributes: ['village_code', 'village_name', 'village_lgd_code']
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    // Format response data
    const mothersList = mothers.map(mother => ({
      child_id: mother.id,
      mother_name: mother.mother_name,
      father_husband_name: mother.father_husband_name || null,
      child_name: mother.child_name,
      mother_mobile: mother.mother_mobile,
      delivery_date: mother.dob,
      delivery_time: mother.delivery_time || null,
      delivery_type: mother.delivery_type || null,
      blood_group: mother.blood_group || null,
      child_gender: mother.gender,
      child_order: mother.child_order || null,
      plant_quantity: mother.plant_quantity || null,
      government_schemes: {
        mmjy: mother.mmjy || null,
        pmmvy: mother.pmmvy || null
      },
      additional_info: {
        birth_certificate: mother.birth_certificate || null,
        is_shramik_card: mother.is_shramik_card || null,
        is_used_ayushman_card: mother.is_used_ayushman_card || null,
        ayushman_card_amount: mother.ayushman_card_amount || null,
        is_benefit_nsy: mother.is_benefit_nsy || null,
        is_nsy_form: mother.is_nsy_form || null
      },
      location: {
        district_name: mother.district?.district_name || 'N/A',
        block_name: mother.block?.block_name || 'N/A',
        village_name: mother.village?.village_name || 'N/A'
      },
      registration_date: mother.created_at
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    console.log(`✅ Mothers list retrieved - Total: ${count}, Page: ${pageNum}/${totalPages}, Results: ${mothers.length}`);

    res.json({
      success: true,
      message: 'Mothers list retrieved successfully',
      data: {
        mothers: mothersList,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_records: count,
          per_page: limitNum,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('❌ Get mothers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mothers list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get full details of a specific mother by child ID
 * Only returns data for mothers registered by this hospital
 */
const getMotherInfo = async (req, res) => {
  try {
    const { child_id } = req.params;
    console.log(`Mother info requested for child_id: ${child_id} by hospital user: ${req.user.hospital_id}`);

    // Validate child_id parameter
    if (!child_id || isNaN(child_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid child_id parameter is required'
      });
    }

    // Get mother/child details with all related information
    const mother = await Child.findOne({
      where: {
        id: child_id,
        hospital_id: req.user.hospital_id // Ensure this child was registered by current hospital
      },
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['district_code', 'district_name', 'lgd_district_code']
        },
        {
          model: Block,
          as: 'block',
          attributes: ['block_code', 'block_name', 'lgd_block_code']
        }
      ]
    });

    if (!mother) {
      return res.status(404).json({
        success: false,
        message: 'Mother/child record not found or not registered by your hospital'
      });
    }

    // Get user account details for the mother
    const userAccount = await User.findOne({
      where: { mobile: mother.mother_mobile },
      attributes: ['id', 'userid', 'name', 'mobile', 'is_password_changed', 'is_active', 'created_at']
    });

    // Format comprehensive response
    const motherDetails = {
      child_info: {
        child_id: mother.id,
        child_name: mother.child_name,
        mother_name: mother.mother_name,
        mother_mobile: mother.mother_mobile,
        delivery_date: mother.dob,
        child_gender: mother.gender,
        registration_date: mother.created_at,
        last_updated: mother.updated_at,
        is_active: mother.is_active
      },
      location_details: {
        district: mother.district ? {
          district_code: mother.district.district_code,
          district_name: mother.district.district_name,
          lgd_district_code: mother.district.lgd_district_code
        } : null,
        block: mother.block ? {
          block_code: mother.block.block_code,
          block_name: mother.block.block_name,
          lgd_block_code: mother.block.lgd_block_code
        } : null,
        village: mother.village ? {
          village_code: mother.village.village_code,
          village_name: mother.village.village_name,
          village_lgd_code: mother.village.village_lgd_code
        } : null
      },
      user_account: userAccount ? {
        user_id: userAccount.id,
        userid: userAccount.userid,
        name: userAccount.name,
        mobile: userAccount.mobile,
        is_password_changed: !!userAccount.is_password_changed,
        is_active: userAccount.is_active,
        account_created: userAccount.created_at
      } : null
    };

    console.log(`✅ Mother details retrieved for child_id: ${child_id}, mother: ${mother.mother_name}`);

    res.json({
      success: true,
      message: 'Mother details retrieved successfully',
      data: motherDetails
    });

  } catch (error) {
    console.error('❌ Get mother info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mother details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDashboard,
  getPendingVerificationPhotos,
  verifyPhoto,
  getAllVerificationPhotos,
  getMothersList,
  getMotherInfo
};
