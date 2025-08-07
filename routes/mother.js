const express = require('express');
const router = express.Router();
const motherController = require('../controllers/motherController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const multer = require('multer');
const path = require('path');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/plant-photos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * Mother plant tracking routes
 * All routes require mother authentication
 */

// Get mother's plant tracking list
router.get('/plants', authMiddleware, roleMiddleware('mother'), motherController.getMotherPlantTrackingList);

// Get detailed tracking for a specific plant
router.get('/plants/:assignmentId/details', authMiddleware, roleMiddleware('mother'), motherController.getMotherPlantTrackingDetails);

// Upload plant photo with location
router.post('/plants/:assignmentId/upload-photo', 
  authMiddleware, 
  roleMiddleware('mother'), 
  upload.single('photo'), 
  motherController.uploadMotherPlantPhoto
);

module.exports = router;
