const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/auth');

// Location routes
router.get('/districts', authMiddleware, locationController.getDistricts);
router.get('/blocks/:districtId', authMiddleware, locationController.getBlocksByDistrict);
router.get('/villages/:blockId', authMiddleware, locationController.getVillagesByBlock);

module.exports = router;
