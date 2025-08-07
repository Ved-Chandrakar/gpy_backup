const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Photo management routes
router.post('/plant-photo', authMiddleware, roleMiddleware('mitanin', 'mother'), photoController.uploadPlantPhoto);
router.get('/plant-photos', authMiddleware, photoController.getPlantPhotos);
router.get('/plant-photos/:id', authMiddleware, photoController.getPlantPhotoById);

module.exports = router;
