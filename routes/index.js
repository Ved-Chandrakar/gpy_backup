const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const motherRoutes = require('./mothers');
const plantRoutes = require('./plants');
const photoRoutes = require('./photos');
const replacementRoutes = require('./replacements');
const dashboardRoutes = require('./dashboard');
const locationRoutes = require('./locations');
const hospitalRoutes = require('./hospital');
const motherTrackingRoutes = require('./mother');
const mitaninRoutes = require('./mitanin');
const fcmRoutes = require('./fcm');

// Use routes
router.use('/auth', authRoutes);
router.use('/mothers', motherRoutes);
router.use('/', plantRoutes);
router.use('/', photoRoutes);
router.use('/', replacementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/locations', locationRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/mother', motherTrackingRoutes);
router.use('/mitanin', mitaninRoutes);
router.use('/fcm', fcmRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Green Paalna Yojna API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
