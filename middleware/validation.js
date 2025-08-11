const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errorDetails
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    userId: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'User ID must be at least 3 characters long',
        'string.max': 'User ID cannot exceed 50 characters',
        'any.required': 'User ID is required'
      }),
    password: Joi.string().min(6).required(),
    loginType: Joi.string().valid('hospital', 'mother', 'mitanin', 'aww').required()
      .messages({
        'any.only': 'Login type must be one of: hospital, mother, mitanin, aww',
        'any.required': 'Login type is required'
      })
  }),

  // Change password schema
  changePassword: Joi.object({
    currentPassword: Joi.string().min(6).required()
      .messages({
        'string.min': 'Current password must be at least 6 characters',
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string().min(6).required()
      .messages({
        'string.min': 'New password must be at least 6 characters',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({
        'any.only': 'Confirm password must match new password',
        'any.required': 'Confirm password is required'
      })
  }),

  // Token refresh schema
  tokenRefresh: Joi.object({
    refreshToken: Joi.string().required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  }),

  // Child registration schema
  childRegistration: Joi.object({
    mother_name: Joi.string().min(2).max(100).required(),
    mother_mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    mother_aadhar: Joi.string().pattern(/^\d{12}$/).optional(),
    child_name: Joi.string().min(2).max(100).optional(),
    dob: Joi.date().max('now').required(),
    delivery_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
      .messages({
        'string.pattern.base': 'Delivery time must be in HH:MM format (24-hour)'
      }),
    gender: Joi.string().valid('male', 'female').required(),
    child_order: Joi.string().valid('first', 'second', 'third', 'fourth').optional(),
    plants: Joi.array().items(
      Joi.object({
        plant_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        status: Joi.string().valid('good', 'dead', 'pending').optional().default('good')
      })
    ).optional().custom((value, helpers) => {
      if (value && value.length > 0) {
        // Check for duplicate plant_ids
        const plantIds = value.map(item => item.plant_id);
        const uniquePlantIds = new Set(plantIds);
        if (plantIds.length !== uniquePlantIds.size) {
          return helpers.error('any.custom', { message: 'Duplicate plant IDs are not allowed' });
        }
        
        // Check total quantity does not exceed 5
        const totalQuantity = value.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity > 5) {
          return helpers.error('any.custom', { message: 'Total plant quantity cannot exceed 5' });
        }
      }
      return value;
    })
      .messages({
        'any.custom': '{{#message}}'
      }),
    mmjy: Joi.string().valid('yes', 'no').optional(),
    pmmvy: Joi.string().valid('yes', 'no').optional(),
    weight_at_birth: Joi.number().positive().max(10).optional(),
    district_id: Joi.number().integer().positive().required(),
    block_id: Joi.number().integer().positive().required(),
    address: Joi.string().max(500).optional(),
    assigned_mitanin_id: Joi.number().integer().positive().optional()
  }),

  // Plant assignment schema
  plantAssignment: Joi.object({
    child_id: Joi.number().integer().positive().required(),
    plant_ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(5).required()
  }),

  // Plant photo upload schema
  plantPhotoUpload: Joi.object({
    assignment_id: Joi.number().integer().positive().required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    growth_stage: Joi.string().valid('seedling', 'sapling', 'young', 'mature').required(),
    health_status: Joi.string().valid('healthy', 'moderate', 'poor', 'dead').required(),
    notes: Joi.string().max(500).optional()
  }),

  // Replacement request schema
  replacementRequest: Joi.object({
    assignment_id: Joi.number().integer().positive().required(),
    reason: Joi.string().valid('died', 'diseased', 'damaged', 'stolen', 'other').required(),
    description: Joi.string().max(500).optional()
  }),

  // User creation schema
  userCreation: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).required(),
    role_id: Joi.number().integer().positive().required(),
    district_id: Joi.number().integer().positive().optional(),
    block_id: Joi.number().integer().positive().optional(),
    hospital_name: Joi.string().max(200).optional()
  }),

  // Hospital mother registration schema (new fields)
  hospitalMotherRegistration: Joi.object({
    mother_name: Joi.string().min(2).max(100).required()
      .messages({
        'any.required': 'Mother name is required',
        'string.min': 'Mother name must be at least 2 characters',
        'string.max': 'Mother name cannot exceed 100 characters'
      }),
    father_husband_name: Joi.string().min(2).max(100).required()
      .messages({
        'any.required': 'Father/Husband name is required'
      }),
    mobile_number: Joi.string().pattern(/^[6-9]\d{9}$/).required()
      .messages({
        'any.required': 'Mobile number is required',
        'string.pattern.base': 'Mobile number must be 10 digits starting with 6-9'
      }),
    delivery_date: Joi.date().max('now').required()
      .messages({
        'any.required': 'Delivery date is required',
        'date.max': 'Delivery date cannot be in the future'
      }),
    delivery_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
      .messages({
        'string.pattern.base': 'Delivery time must be in HH:MM format (24-hour)'
      }),
    delivery_type: Joi.string().valid('normal', 'cesarean', 'assisted').required()
      .messages({
        'any.required': 'Delivery type is required',
        'any.only': 'Delivery type must be: normal, cesarean, or assisted'
      }),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required()
      .messages({
        'any.required': 'Blood group is required',
        'any.only': 'Invalid blood group'
      }),
    child_gender: Joi.string().valid('male', 'female').required()
      .messages({
        'any.required': 'Child gender is required',
        'any.only': 'Child gender must be: male or female'
      }),
    child_order: Joi.string().valid('first', 'second', 'third', 'fourth').optional()
      .messages({
        'any.only': 'Child order must be: first, second, third, or fourth'
      }),
    plant_quantity: Joi.array().items(
      Joi.object({
        plant_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).optional().custom((value, helpers) => {
      if (value && value.length > 0) {
        // Check for duplicate plant_ids
        const plantIds = value.map(item => item.plant_id);
        const uniquePlantIds = new Set(plantIds);
        if (plantIds.length !== uniquePlantIds.size) {
          return helpers.error('any.custom', { message: 'Duplicate plant IDs are not allowed' });
        }
        
        // Check total quantity does not exceed 5
        const totalQuantity = value.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity > 5) {
          return helpers.error('any.custom', { message: 'Total plant quantity cannot exceed 5' });
        }
      }
      return value;
    })
      .messages({
        'any.custom': '{{#message}}'
      }),
    plants: Joi.alternatives().try(
      Joi.array().items(Joi.number().integer().positive()).max(5),
      Joi.string() // For JSON string input
    ).required()
      .messages({
        'any.required': 'Plants selection is required',
        'array.max': 'Maximum 5 plants allowed'
      }),
    mmjy: Joi.string().valid('yes', 'no').optional()
      .messages({
        'any.only': 'MMJY must be: yes or no'
      }),
    pmmvy: Joi.string().valid('yes', 'no').optional()
      .messages({
        'any.only': 'PMMVY must be: yes or no'
      }),
    district_lgd_code: Joi.number().integer().positive().required()
      .messages({
        'any.required': 'District LGD code is required'
      }),
    block_lgd_code: Joi.number().integer().positive().required()
      .messages({
        'any.required': 'Block LGD code is required'
      })
  })
};

module.exports = {
  validateRequest,
  schemas
};
