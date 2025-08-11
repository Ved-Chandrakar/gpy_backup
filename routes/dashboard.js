const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Dashboard routes
router.get('/state', authMiddleware, roleMiddleware('state'), dashboardController.getStateDashboard);
router.get('/district/:id', authMiddleware, roleMiddleware('collector', 'state'), dashboardController.getDistrictDashboard);
router.get('/summary', authMiddleware, dashboardController.getSummaryStats);

module.exports = router;
