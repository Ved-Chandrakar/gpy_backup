const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Plant management routes
router.post('/assign-plants', authMiddleware, roleMiddleware('hospital'), plantController.assignPlants);
router.get('/plant-assignments', authMiddleware, plantController.getPlantAssignments);
router.get('/plants', authMiddleware, plantController.getPlants);

module.exports = router;
