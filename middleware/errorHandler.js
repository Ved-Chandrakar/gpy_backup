const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    message: 'Server Error'
  };

  // Mongoose/Sequelize validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      message: 'Validation Error',
      errors: message
    };
  }

  // Duplicate key error
  if (err.code === 11000 || err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      message
    };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token'
    };
  }

  // File upload error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = {
        success: false,
        message: 'File too large'
      };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = {
        success: false,
        message: 'Too many files'
      };
    } else {
      error = {
        success: false,
        message: 'File upload error'
      };
    }
  }

  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
