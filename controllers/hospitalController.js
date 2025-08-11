const { District, Plant, Block, Child, User, Village, PlantAssignment, PlantTrackingSchedule, PlantPhoto, Role } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { generateTrackingSchedule } = require('../utils/plantTrackingUtils');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/mothers';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'delivery_document') {
      // Allow PDF, DOC, DOCX, JPG, PNG for documents
      const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed for delivery documents!'));
      }
    } else if (file.fieldname === 'mother_photo') {
      // Allow only images for mother photo
      const allowedTypes = /jpg|jpeg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, PNG files are allowed for mother photos!'));
      }
    }
  }
});

/**
 * Generate random number within a range
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get Hospital Dashboard Data
 * Returns real counters and district/block/plant lists
 */
const getDashboard = async (req, res) => {
  try {
    console.log(`Hospital dashboard requested by user: ${req.user.id}`);

    // Get real counters from database
    const [
      totalMothers,
      activePlants,
      uploadedPhotos,
      distributedPlants
    ] = await Promise.all([
      // Count unique mothers (users with mother role) who have children registered by this hospital
      sequelize.query(`
        SELECT COUNT(DISTINCT u.id) as count
        FROM tbl_user u
        INNER JOIN master_role r ON u.role_id = r.id
        WHERE r.name = 'mother'
        AND u.mobile IN (
          SELECT DISTINCT c.mother_mobile 
          FROM tbl_child c 
          WHERE c.hospital_id = :hospitalId
        )
      `, {
        replacements: { hospitalId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }).then(result => result[0].count),
      
      // Active plant assignments for this hospital's children
      PlantAssignment.count({
        where: { status: 'active' },
        include: [{
          model: Child,
          as: 'child',
          where: { hospital_id: req.user.id },
          attributes: []
        }]
      }),
      
      // Uploaded photos for this hospital's plant assignments
      PlantPhoto.count({
        include: [{
          model: PlantAssignment,
          as: 'assignment',
          include: [{
            model: Child,
            as: 'child',
            where: { hospital_id: req.user.id },
            attributes: []
          }],
          attributes: []
        }]
      }),
      
      // Total distributed plants (same as active plant assignments)
      PlantAssignment.count({
        include: [{
          model: Child,
          as: 'child',
          where: { hospital_id: req.user.id },
          attributes: []
        }]
      })
    ]);

    const counters = {
      total_mothers: totalMothers,
      active_plants: activePlants,
      uploaded_photos: uploadedPhotos,
      distributed_plants: distributedPlants
    };

    // Get real district list from database
    const districts = await District.findAll({
      where: { lgd_district_code: 387 }, // Ensure only districts with LGD codes
      attributes: ['district_code', 'district_name', 'lgd_district_code'],
      order: [['district_name', 'ASC']]
    });

    // Get block list from database
    const blocks = await Block.findAll({
      where: { lgd_district_code: 387 },
      attributes: ['block_code', 'block_name', 'lgd_block_code', 'district_code'],
      order: [['block_name', 'ASC']]
    });

    // Get plant list from database
    const plants = await Plant.findAll({
      attributes: ['id', 'name', 'local_name', 'category'],
      order: [['name', 'ASC']]
    });

    // Format district list
    const district_list = districts.map(district => ({
      district_code: district.district_code,
      district_name: district.district_name,
      lgd_district_code: district.lgd_district_code
    }));

    // Format block list
    const block_list = blocks.map(block => ({
      block_code: block.block_code,
      block_name: block.block_name,
      lgd_block_code: block.lgd_block_code,
      district_code: block.district_code
    }));

    // Format plant list
    const plant_list = plants.map(plant => ({
      id: plant.id,
      name: plant.name,
      local_name: plant.local_name,
      category: plant.category
    }));

    console.log(`✅ Hospital dashboard data retrieved - Mothers: ${counters.total_mothers}, Active Plants: ${counters.active_plants}, Photos: ${counters.uploaded_photos}, Distributed: ${counters.distributed_plants}, Districts: ${district_list.length}, Blocks: ${block_list.length}, Plant Types: ${plant_list.length}`);

    res.json({
      success: true,
      message: 'Hospital dashboard data retrieved successfully',
      data: {
        counters,
        district_list,
        block_list,
        plant_list
      }
    });

  } catch (error) {
    console.error('❌ Hospital dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Register New Mother
 * Handles mother registration with file uploads
 */
const registerNewMother = async (req, res) => {
  try {
    console.log(`New mother registration requested by user: ${req.user.id}`);
    
    // Validate required fields
    const {
      mother_name,
      father_husband_name, 
      mobile_number,
      delivery_date,
      delivery_time,        // New field
      delivery_type,
      blood_group,
      district_lgd_code,
      block_lgd_code,
      plants,
      child_gender,
      child_order,          // New field
      weight_at_birth,      // New field
      mmjy,                 // New field
      pmmvy,                // New field
      birth_certificate,    // New field
      is_shramik_card,      // New field
      is_used_ayushman_card, // New field
      ayushman_card_amount, // New field
      is_benefit_nsy,       // New field (for female child)
      is_nsy_form           // New field (for female child)
    } = req.body;

    // Basic validation
    if (!mother_name || !father_husband_name || !mobile_number || !delivery_date || 
        !delivery_type || !blood_group || !district_lgd_code || !block_lgd_code || 
        !child_gender || !plants) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided (mother_name, father_husband_name, mobile_number, delivery_date, delivery_type, blood_group, district_lgd_code, block_lgd_code, child_gender, plants)'
      });
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits'
      });
    }

    // Validate delivery time format if provided
    if (delivery_time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(delivery_time)) {
        return res.status(400).json({
          success: false,
          message: 'Delivery time must be in HH:MM format (24-hour)'
        });
      }
    }

    // Validate delivery type
    const validDeliveryTypes = ['normal', 'cesarean', 'assisted'];
    if (!validDeliveryTypes.includes(delivery_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery type. Must be: normal, cesarean, or assisted'
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group'
      });
    }

    // Validate child gender
    const validGenders = ['male', 'female'];
    if (!validGenders.includes(child_gender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid child gender. Must be: male or female'
      });
    }

    // Validate child order if provided
    if (child_order) {
      const validOrders = ['first', 'second', 'third', 'fourth'];
      if (!validOrders.includes(child_order)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid child order. Must be: first, second, third, or fourth'
        });
      }
    }

    // Validate MMJY and PMMVY if provided
    if (mmjy && !['yes', 'no'].includes(mmjy)) {
      return res.status(400).json({
        success: false,
        message: 'MMJY must be: yes or no'
      });
    }

    if (pmmvy && !['yes', 'no'].includes(pmmvy)) {
      return res.status(400).json({
        success: false,
        message: 'PMMVY must be: yes or no'
      });
    }

    // Validate new fields
    if (birth_certificate && !['yes', 'no'].includes(birth_certificate)) {
      return res.status(400).json({
        success: false,
        message: 'Birth certificate must be: yes or no'
      });
    }

    if (is_shramik_card && !['yes', 'no'].includes(is_shramik_card)) {
      return res.status(400).json({
        success: false,
        message: 'Shramik card must be: yes or no'
      });
    }

    if (is_used_ayushman_card && !['yes', 'no'].includes(is_used_ayushman_card)) {
      return res.status(400).json({
        success: false,
        message: 'Ayushman card usage must be: yes or no'
      });
    }

    // Validate ayushman card amount if ayushman card was used
    if (is_used_ayushman_card === 'yes') {
      if (ayushman_card_amount === undefined || ayushman_card_amount === null || ayushman_card_amount === '') {
        return res.status(400).json({
          success: false,
          message: 'Ayushman card amount is required when Ayushman card is used'
        });
      }
      
      const amount = parseFloat(ayushman_card_amount);
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Ayushman card amount must be a valid positive number'
        });
      }
    }

    // Validate NSY fields only for female children
    if (child_gender === 'female') {
      if (is_benefit_nsy && !['yes', 'no'].includes(is_benefit_nsy)) {
        return res.status(400).json({
          success: false,
          message: 'NSY benefit eligibility must be: yes or no'
        });
      }

      if (is_benefit_nsy === 'yes' && is_nsy_form && !['yes', 'no'].includes(is_nsy_form)) {
        return res.status(400).json({
          success: false,
          message: 'NSY form received must be: yes or no'
        });
      }
    } else {
      // For male children, NSY fields should not be provided
      if (is_benefit_nsy || is_nsy_form) {
        return res.status(400).json({
          success: false,
          message: 'NSY fields are only applicable for female children'
        });
      }
    }

    // Validate weight_at_birth if provided
    if (weight_at_birth !== undefined && weight_at_birth !== null && weight_at_birth !== '') {
      const weight = parseFloat(weight_at_birth);
      if (isNaN(weight) || weight < 0.1 || weight > 10) {
        return res.status(400).json({
          success: false,
          message: 'Weight at birth must be a valid number between 0.1 and 10 kg'
        });
      }
    }

    // Process plant selection - new format with plant_id, quantity, and status
    let plantIds = [];
    let finalPlantQuantity = null;
    let plantAssignmentData = [];

    try {
      const plantsData = Array.isArray(plants) ? plants : JSON.parse(plants);
      
      console.log('🌱 Processing plants data:', {
        raw_plants: plants,
        parsed_plants: plantsData,
        is_array: Array.isArray(plantsData)
      });
      
      if (!Array.isArray(plantsData) || plantsData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Plants array cannot be empty'
        });
      }

      const processedPlants = [];
      
      for (const item of plantsData) {
        if (typeof item !== 'object' || !item.plant_id || !item.quantity) {
          return res.status(400).json({
            success: false,
            message: 'Each plant item must have plant_id and quantity properties'
          });
        }

        const plantId = parseInt(item.plant_id, 10);
        const quantity = parseInt(item.quantity, 10);
        const status = item.status || 'good'; // Default to 'good' if not provided

        if (isNaN(plantId) || plantId <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid plant ID: ${item.plant_id}`
          });
        }
        
        if (isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity: ${item.quantity}`
          });
        }

        // Validate status
        const validStatuses = ['good', 'dead', 'pending'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`
          });
        }
        
        processedPlants.push({ plant_id: plantId, quantity: quantity, status: status });
        
        // Create assignment data for each quantity
        for (let i = 0; i < quantity; i++) {
          plantAssignmentData.push({ plant_id: plantId, status: status });
        }
      }
      
      // Check total quantity doesn't exceed 5
      const totalQuantity = processedPlants.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity > 5) {
        return res.status(400).json({
          success: false,
          message: 'Total plant quantity cannot exceed 5'
        });
      }
      
      finalPlantQuantity = processedPlants;
      // Extract unique plant IDs for verification
      plantIds = [...new Set(processedPlants.map(item => item.plant_id))];
      
      console.log('🌱 Plant processing completed:', {
        processed_plants: processedPlants,
        unique_plant_ids: plantIds,
        total_quantity: totalQuantity,
        assignment_data_count: plantAssignmentData.length
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Plants validation error: ${error.message}`
      });
    }

    // Verify district exists
    const district = await District.findOne({
      where: { lgd_district_code: district_lgd_code }
    });
    
    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'Invalid district LGD code'
      });
    }

    // Verify block exists
    const block = await Block.findOne({
      where: { lgd_block_code: block_lgd_code }
    });
    
    if (!block) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block LGD code'
      });
    }

    // Verify village exists (use first village in block)
    const village = await Village.findOne({
      where: { block_code: block.block_code }
    });
    
    if (!village) {
      return res.status(400).json({
        success: false,
        message: 'No villages found for the specified block'
      });
    }

    // Verify plants exist
    if (plantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No plants specified for assignment'
      });
    }

    const existingPlants = await Plant.findAll({
      where: { id: plantIds },
      attributes: ['id', 'name']
    });

    if (existingPlants.length !== plantIds.length) {
      const foundPlantIds = existingPlants.map(p => p.id);
      const invalidPlantIds = plantIds.filter(id => !foundPlantIds.includes(id));
      
      // Get all available plants to show user what's valid
      const availablePlants = await Plant.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'local_name'],
        order: [['id', 'ASC']]
      });
      
      console.error('❌ Plant validation failed:', {
        requested_ids: plantIds,
        found_ids: foundPlantIds,
        invalid_ids: invalidPlantIds,
        total_requested: plantIds.length,
        total_found: existingPlants.length,
        available_plants: availablePlants.map(p => ({ id: p.id, name: p.name, local_name: p.local_name }))
      });
      
      return res.status(400).json({
        success: false,
        message: 'One or more plant IDs are invalid',
        data: {
          requested_plant_ids: plantIds,
          found_plant_ids: foundPlantIds,
          invalid_plant_ids: invalidPlantIds,
          valid_plants: existingPlants.map(p => ({ id: p.id, name: p.name })),
          available_plants: availablePlants.map(p => ({ 
            id: p.id, 
            name: p.name, 
            local_name: p.local_name 
          })),
          error_details: 'Please use valid plant IDs from the available_plants list above'
        }
      });
    }

    // Check for duplicate registration (same mother_name, mobile_number, and child_order)
    const duplicateCheckConditions = {
      mother_name,
      mother_mobile: mobile_number
    };

    // Add child_order to the check if provided
    if (child_order) {
      duplicateCheckConditions.child_order = child_order;
    } else {
      // If no child_order is provided, check for existing registrations without child_order
      duplicateCheckConditions.child_order = null;
    }

    const existingRegistration = await Child.findOne({
      where: duplicateCheckConditions
    });

    if (existingRegistration) {
      const orderText = child_order ? `${child_order} child` : 'child (no order specified)';
      return res.status(400).json({
        success: false,
        message: `Duplicate registration detected. A ${orderText} for mother "${mother_name}" with mobile number ${mobile_number} is already registered (Child ID: ${existingRegistration.id}). Each child order can only be registered once per mother.`
      });
    }

    // Handle file uploads - support both single and multiple file uploads
    let delivery_document_path = null;
    let mother_photo_path = null;

    // Check for multiple files (req.files) - preferred method
    if (req.files) {
      const files = req.files;
      
      // Handle delivery document
      if (files.delivery_document && files.delivery_document.length > 0) {
        delivery_document_path = files.delivery_document[0].path;
      }
      
      // Handle mother photo
      if (files.mother_photo && files.mother_photo.length > 0) {
        mother_photo_path = files.mother_photo[0].path;
      }
      
      // Handle fallback single photo field
      if (files.photo && files.photo.length > 0) {
        mother_photo_path = files.photo[0].path;
      }
    }
    // Check for single file (req.file) - fallback method
    else if (req.file) {
      if (req.file.fieldname === 'photo' || req.file.fieldname === 'mother_photo') {
        mother_photo_path = req.file.path;
      } else if (req.file.fieldname === 'delivery_document') {
        delivery_document_path = req.file.path;
      }
    }

    // Start database transaction
    const transaction = await Child.sequelize.transaction();

    try {
      // Check if user already exists with this mobile number
      let existingUser = await User.findOne({
        where: { mobile: mobile_number }
      });

      let motherUser;
      
      if (existingUser) {
        motherUser = existingUser;
        console.log(`👤 Existing user found for mobile ${mobile_number}`);
      } else {
        // Create new user account for mother
        const defaultPassword = mobile_number; // Use mobile number as password
        const userid = mobile_number; // Use mobile number directly as userid for easy remembering
        
        motherUser = await User.create({
          userid,
          name: mother_name,
          mobile: mobile_number,
          password: defaultPassword,
          role_id: 5, // Mother role
          district_id: null, // Will set manually if needed
          block_id: null,     // Will set manually if needed
          is_password_changed: 0, // Default to 0 (password not changed)
          is_active: true
        }, { transaction });
        
        console.log(`👤 New user created for mother: ${userid}`);
      }

      // Create child record
      const childData = {
        mother_name,
        father_husband_name: father_husband_name || null,
        mother_mobile: mobile_number,
        delivery_type: delivery_type || null,
        blood_group: blood_group || null,
        child_name: `Baby of ${mother_name}`, // Auto-generate child name
        dob: delivery_date,
        delivery_time: delivery_time || null,
        gender: child_gender,
        child_order: child_order || null,
        weight_at_birth: weight_at_birth ? parseFloat(weight_at_birth) : null,
        plant_quantity: finalPlantQuantity, // Use plant_quantity instead of plants
        mmjy: mmjy || null,
        pmmvy: pmmvy || null,
        birth_certificate: birth_certificate || null,
        is_shramik_card: is_shramik_card || null,
        is_used_ayushman_card: is_used_ayushman_card || null,
        ayushman_card_amount: (is_used_ayushman_card === 'yes' && ayushman_card_amount) ? parseFloat(ayushman_card_amount) : null,
        is_benefit_nsy: (child_gender === 'female' && is_benefit_nsy) ? is_benefit_nsy : null,
        is_nsy_form: (child_gender === 'female' && is_benefit_nsy === 'yes' && is_nsy_form) ? is_nsy_form : null,
        hospital_id: req.user.id, // Current hospital user ID
        district_code: district.district_code,
        block_code: block.block_code,
        village_code: village.village_code,
        is_active: true
      };

      const child = await Child.create(childData, { transaction });

      // Create plant assignments based on plants data
      const plantAssignments = [];
      if (plantAssignmentData && plantAssignmentData.length > 0) {
        for (const plantData of plantAssignmentData) {
          const assignment = await PlantAssignment.create({
            child_id: child.id,
            plant_id: plantData.plant_id,
            assigned_date: new Date(),
            status: 'active', // Always active for new assignments
            assigned_by: req.user.id, // Hospital user who assigned the plant
            notes: `Plant assigned during mother registration on ${new Date().toISOString().split('T')[0]} with status: ${plantData.status}`
          }, { transaction });
          
          plantAssignments.push(assignment);
        }
      }

      console.log(`🌱 Created ${plantAssignments.length} plant assignments for child_id: ${child.id}`);
      
      // Log plant assignment summary
      if (finalPlantQuantity && finalPlantQuantity.length > 0) {
        console.log('Plant assignment summary:');
        finalPlantQuantity.forEach(item => {
          console.log(`  - Plant ID ${item.plant_id}: ${item.quantity} plant(s) with status: ${item.status}`);
        });
      }

      // Create tracking schedules for each plant assignment
      const trackingSchedules = [];
      console.log('📅 Starting tracking schedule creation...');
      
      try {
        for (const assignment of plantAssignments) {
          console.log(`Creating schedules for assignment ${assignment.id}...`);
          
          // Use the utility function to generate proper 8-schedule pattern
          // Month 1: 4 weekly, Month 2: 2 bi-weekly, Month 3: 2 bi-weekly
          const schedules = await generateTrackingSchedule(assignment.id, assignment.assigned_date, transaction);
          trackingSchedules.push(...schedules);
          
          console.log(`✅ Created ${schedules.length} schedules for assignment ${assignment.id}`);
        }
      } catch (scheduleError) {
        console.error('❌ Error creating tracking schedules:', scheduleError.message);
        console.error('Schedule creation stack:', scheduleError.stack);
        throw scheduleError; // Re-throw to trigger transaction rollback
      }

      console.log(`📅 Created ${trackingSchedules.length} tracking schedules (8 schedules per plant: 4 weekly + 2 bi-weekly + 2 bi-weekly)`);

      // Commit transaction
      await transaction.commit();

      console.log('✅ Mother and child registration completed:', {
        mother_name,
        mobile_number,
        delivery_date,
        delivery_time,
        child_id: child.id,
        user_id: motherUser.id,
        child_order,
        plants: finalPlantQuantity,
        mmjy,
        pmmvy,
        district: district.district_name,
        block: block.block_name,
        village: village.village_name,
        plant_assignments: plantAssignments.length,
        tracking_schedules: trackingSchedules.length,
        has_document: !!delivery_document_path,
        has_photo: !!mother_photo_path
      });

      res.status(201).json({
        success: true,
        message: 'Mother and child registered successfully',
        data: {
          registration_id: `REG${child.id}${Date.now()}`,
          child_id: child.id,
          mother_user_id: motherUser.id,
          mother_name,
          father_husband_name: father_husband_name || null,
          child_name: child.child_name,
          mobile_number,
          delivery_date,
          delivery_time: delivery_time || null,
          delivery_type: delivery_type || null,
          blood_group: blood_group || null,
          child_gender,
          child_order: child_order || null,
          weight_at_birth: weight_at_birth ? parseFloat(weight_at_birth) : null,
          plants: finalPlantQuantity,
          mmjy: mmjy || null,
          pmmvy: pmmvy || null,
          login_credentials: {
            userid: motherUser.userid,
            default_password: existingUser ? 'User already exists - use existing password' : mobile_number
          },
          location: {
            district: district.district_name,
            block: block.block_name,
            village: village.village_name
          },
          assigned_plants: finalPlantQuantity ? finalPlantQuantity.map(item => {
            const plant = existingPlants.find(p => p.id === item.plant_id);
            const assignmentsForPlant = plantAssignments.filter(a => a.plant_id === item.plant_id);
            return {
              plant_id: item.plant_id,
              plant_name: plant ? plant.name : 'Unknown',
              quantity: item.quantity,
              status: item.status,
              assignment_ids: assignmentsForPlant.map(a => a.id),
              assignment_status: 'active',
              assigned_date: new Date().toISOString().split('T')[0],
              tracking_weeks: 8 // 8 tracking schedules: 4 weekly + 2 bi-weekly + 2 bi-weekly
            };
          }) : [],
          tracking_info: {
            total_schedules: trackingSchedules.length,
            tracking_duration: '3 months (8 schedules)',
            photo_frequency: 'Month 1: Weekly, Month 2-3: Bi-weekly',
            schedule_pattern: '4 weekly + 2 bi-weekly + 2 bi-weekly',
            next_photo_due: trackingSchedules.length > 0 ? trackingSchedules[0].due_date : null
          },
          government_schemes: {
            mmjy: mmjy || 'not specified',
            pmmvy: pmmvy || 'not specified'
          },
          additional_info: {
            birth_certificate: birth_certificate || 'not specified',
            is_shramik_card: is_shramik_card || 'not specified',
            is_used_ayushman_card: is_used_ayushman_card || 'not specified',
            ayushman_card_amount: (is_used_ayushman_card === 'yes' && ayushman_card_amount) ? parseFloat(ayushman_card_amount) : null,
            is_benefit_nsy: (child_gender === 'female') ? (is_benefit_nsy || 'not specified') : 'not applicable (male child)',
            is_nsy_form: (child_gender === 'female' && is_benefit_nsy === 'yes') ? (is_nsy_form || 'not specified') : 'not applicable'
          },
          files_uploaded: {
            delivery_document: !!delivery_document_path,
            mother_photo: !!mother_photo_path
          }
        }
      });

    } catch (dbError) {
      // Rollback transaction on error
      await transaction.rollback();
      
      console.error('❌ Database transaction failed:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Mother registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering mother',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get list of mothers registered by this hospital
 * Supports pagination and search
 */
const getMothersList = async (req, res) => {
  try {
    console.log(`Mothers list requested by hospital user: ${req.user.id}`);

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
      hospital_id: req.user.id // Only mothers registered by this hospital
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
      weight_at_birth: mother.weight_at_birth || null,
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
    console.log(`Mother info requested for child_id: ${child_id} by hospital user: ${req.user.id}`);

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
        hospital_id: req.user.id // Ensure this child was registered by current hospital
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

    // Get plant assignments and tracking information
    const plantAssignments = await PlantAssignment.findAll({
      where: { child_id: child_id },
      include: [
        {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name', 'local_name', 'category']
        }
      ],
      attributes: ['id', 'plant_id', 'assigned_date', 'status', 'notes'],
      order: [['assigned_date', 'ASC']]
    });

    // Get tracking schedules with photos
    const trackingSchedules = await PlantTrackingSchedule.findAll({
      where: {
        assignment_id: plantAssignments.map(assignment => assignment.id)
      },
      attributes: ['id', 'assignment_id', 'week_number', 'month_number', 'due_date', 'upload_status', 'remarks'],
      order: [['week_number', 'ASC']]
    });

    // Get photos for these tracking schedules
    const photos = await PlantPhoto.findAll({
      where: {
        assignment_id: plantAssignments.map(assignment => assignment.id)
      },
      attributes: ['id', 'assignment_id', 'photo_url', 'upload_date', 'is_verified', 'verified_by', 'week_number'],
      order: [['upload_date', 'ASC']]
    });

    // Organize tracking data by assignment, month, and week
    const trackingInfo = {
      total_assignments: plantAssignments.length,
      total_schedules: trackingSchedules.length,
      tracking_duration: '12 weeks (3 months)',
      photo_frequency: 'Weekly',
      assignments: plantAssignments.map(assignment => {
        const assignmentSchedules = trackingSchedules.filter(schedule => schedule.assignment_id === assignment.id);
        const assignmentPhotos = photos.filter(photo => photo.assignment_id === assignment.id);
        
        // Group schedules by month
        const monthlyTracking = {};
        assignmentSchedules.forEach(schedule => {
          const month = schedule.month_number;
          if (!monthlyTracking[month]) {
            monthlyTracking[month] = {
              month_number: month,
              month_name: `Month ${month}`,
              weeks: [],
              total_weeks: 0,
              completed_weeks: 0,
              pending_weeks: 0,
              photos_uploaded: 0
            };
          }

          // Find photos for this week
          const weekPhotos = assignmentPhotos.filter(photo => photo.week_number === schedule.week_number);

          // Convert photo paths to full URLs
          const weekPhotosWithUrls = weekPhotos.map(photo => ({
            id: photo.id,
            photo_url: photo.photo_url ? `${req.protocol}://${req.get('host')}/uploads/${photo.photo_url.replace(/^uploads[\\\/]?/, '')}` : null,
            photo_path: photo.photo_url, // Keep original path for reference
            uploaded_at: photo.upload_date,
            verification_status: photo.is_verified ? 'verified' : 'pending',
            mitanin_remarks: photo.verified_by ? `Verified by user ${photo.verified_by}` : null
          }));

          const weekData = {
            week_number: schedule.week_number,
            week_in_month: ((schedule.week_number - 1) % 4) + 1,
            due_date: schedule.due_date,
            upload_status: schedule.upload_status,
            remarks: schedule.remarks,
            photos: weekPhotosWithUrls || [],
            photos_count: weekPhotosWithUrls ? weekPhotosWithUrls.length : 0,
            is_completed: schedule.upload_status === 'completed',
            is_overdue: schedule.upload_status === 'pending' && new Date(schedule.due_date) < new Date()
          };

          monthlyTracking[month].weeks.push(weekData);
          monthlyTracking[month].total_weeks++;
          
          if (weekData.is_completed) {
            monthlyTracking[month].completed_weeks++;
          } else {
            monthlyTracking[month].pending_weeks++;
          }
          
          monthlyTracking[month].photos_uploaded += weekData.photos_count;
        });

        // Calculate assignment progress
        const totalWeeks = assignmentSchedules.length;
        const completedWeeks = assignmentSchedules.filter(s => s.upload_status === 'completed').length;
        const pendingWeeks = assignmentSchedules.filter(s => s.upload_status === 'pending').length;
        const overdueWeeks = assignmentSchedules.filter(s => 
          s.upload_status === 'pending' && new Date(s.due_date) < new Date()
        ).length;
        const totalPhotos = assignmentPhotos.length;

        return {
          assignment_id: assignment.id,
          plant_info: {
            plant_id: assignment.plant_id,
            plant_name: assignment.plant?.name || 'Unknown',
            plant_local_name: assignment.plant?.local_name || 'Unknown',
            plant_category: assignment.plant?.category || 'Unknown'
          },
          assignment_details: {
            assigned_date: assignment.assigned_date,
            status: assignment.status,
            notes: assignment.notes
          },
          tracking_progress: {
            total_weeks: totalWeeks,
            completed_weeks: completedWeeks,
            pending_weeks: pendingWeeks,
            overdue_weeks: overdueWeeks,
            completion_percentage: totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0,
            total_photos_uploaded: totalPhotos,
            next_due_date: assignmentSchedules.find(s => s.upload_status === 'pending')?.due_date || null
          },
          monthly_tracking: Object.values(monthlyTracking).sort((a, b) => a.month_number - b.month_number)
        };
      }),
      overall_progress: {
        total_weeks_all_plants: trackingSchedules.length,
        completed_weeks_all_plants: trackingSchedules.filter(s => s.upload_status === 'completed').length,
        pending_weeks_all_plants: trackingSchedules.filter(s => s.upload_status === 'pending').length,
        overdue_weeks_all_plants: trackingSchedules.filter(s => 
          s.upload_status === 'pending' && new Date(s.due_date) < new Date()
        ).length,
        total_photos_all_plants: photos.length,
        completion_percentage_all_plants: trackingSchedules.length > 0 ? 
          Math.round((trackingSchedules.filter(s => s.upload_status === 'completed').length / trackingSchedules.length) * 100) : 0
      }
    };

    // Format comprehensive response
    const motherDetails = {
      child_info: {
        child_id: mother.id,
        child_name: mother.child_name,
        mother_name: mother.mother_name,
        father_husband_name: mother.father_husband_name || null,
        mother_mobile: mother.mother_mobile,
        delivery_date: mother.dob,
        delivery_time: mother.delivery_time || null,
        delivery_type: mother.delivery_type || null,
        blood_group: mother.blood_group || null,
        child_gender: mother.gender,
        child_order: mother.child_order || null,
        weight_at_birth: mother.weight_at_birth || null,
        plant_quantity: mother.plant_quantity || null,
        registration_date: mother.created_at,
        last_updated: mother.updated_at,
        is_active: mother.is_active
      },
      government_schemes: {
        mmjy: mother.mmjy || null,
        pmmvy: mother.pmmvy || null,
        description: {
          mmjy: 'Mukhyamantri Jeevan Janani Yojna',
          pmmvy: 'Pradhan Mantri Matru Vandana Yojna'
        }
      },
      additional_info: {
        birth_certificate: mother.birth_certificate || null,
        is_shramik_card: mother.is_shramik_card || null,
        is_used_ayushman_card: mother.is_used_ayushman_card || null,
        ayushman_card_amount: mother.ayushman_card_amount || null,
        is_benefit_nsy: (mother.gender === 'female') ? (mother.is_benefit_nsy || null) : 'not applicable (male child)',
        is_nsy_form: (mother.gender === 'female' && (mother.is_benefit_nsy === 'yes')) ? (mother.is_nsy_form || null) : 'not applicable',
        weight_at_birth: mother.weight_at_birth
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
      plant_tracking_info: trackingInfo,
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
  registerNewMother,
  getMothersList,
  getMotherInfo,
  upload
};
