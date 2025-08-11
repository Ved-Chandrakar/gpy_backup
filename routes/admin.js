const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { adminAuth, requireRole, requirePermission } = require('../middleware/adminAuth');
const plantImageUpload = require('../config/plantImageUpload');

// Admin authentication routes (no middleware needed)
router.get('/login', authController.adminLoginPage);
router.post('/secret/:userId',authController.setDefaultPasswordUsingHook);
router.post('/login', authController.adminLogin);
router.get('/logout', authController.adminLogout);
router.get('/forgot-password', authController.forgotPasswordPage);
router.post('/forgot-password', authController.forgotPassword);

// Admin authentication middleware - all other admin routes require authentication
router.use(adminAuth);

// Dashboard
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);
router.get('/api/dashboard-data', adminController.getDashboardData); // New API endpoint for real-time updates

// Users Management (State, Collector, Block Viewer)
router.get('/users', requireRole(['state', 'collector', 'block_viewer']), adminController.users);
router.get('/users/hospitals', requireRole(['state', 'collector', 'block_viewer']), adminController.hospitalUsers);
router.get('/users/mitanins', requireRole(['state', 'collector', 'block_viewer']), adminController.mitaninUsers);
router.get('/users/export', requireRole(['state', 'collector', 'block_viewer']), adminController.exportUsers);
router.get('/users/new', requireRole(['state', 'collector']), adminController.newUserForm);
router.post('/users/new', requireRole(['state', 'collector']), adminController.createUser);
router.get('/users/:id/edit', requireRole(['state', 'collector']), adminController.editUserForm);
router.post('/users/:id/edit', requireRole(['state', 'collector']), adminController.updateUser);
router.get('/users/:id/details', requireRole(['state', 'collector', 'block_viewer']), adminController.getUserDetails);

// Mothers Management
router.get('/mothers', requireRole(['state', 'collector', 'block_viewer']), adminController.mothers);
router.get('/mothers/export', requireRole(['state', 'collector']), adminController.exportMothers);
router.get('/mothers/:mobile/edit', requireRole(['state', 'collector']), adminController.editMotherForm);
router.post('/mothers/:mobile/edit', requireRole(['state', 'collector']), adminController.updateMother);

// Children Management
router.get('/children', requireRole(['state', 'collector', 'block_viewer']), adminController.children);
router.get('/children/export', requireRole(['state', 'collector']), adminController.exportChildren);
router.get('/children/:id', requireRole(['state', 'collector', 'block_viewer']), adminController.viewChild);
router.get('/children/:id/edit', requireRole(['state', 'collector']), adminController.editChildForm);
router.post('/children/:id/edit', requireRole(['state', 'collector']), adminController.updateChild);
router.get('/children/:id/tracking', requireRole(['state', 'collector', 'block_viewer']), adminController.childPlantTracking);

// Plants Management
router.get('/plants', requireRole(['state', 'collector', 'block_viewer']), adminController.plants);
router.get('/plants/add', requireRole(['state', 'collector']), adminController.addPlantForm);
router.post('/plants/add', requireRole(['state', 'collector']), plantImageUpload.single('plant_image'), adminController.createPlant);
router.get('/plants/:id/edit', requireRole(['state', 'collector']), adminController.editPlantForm);
router.post('/plants/:id/edit', requireRole(['state', 'collector']), plantImageUpload.single('plant_image'), adminController.updatePlant);
router.delete('/plants/:id', requireRole(['state', 'collector']), adminController.deletePlant);

// Plant Assignments
router.get('/assignments', requireRole(['state', 'collector', 'block_viewer']), adminController.assignments);
router.get('/assignments/export', requireRole(['state', 'collector']), adminController.exportAssignments);
router.get('/assignments/new', requireRole(['state', 'collector']), adminController.newAssignmentForm);
router.post('/assignments/new', requireRole(['state', 'collector']), adminController.createAssignment);

// Plant Photos
router.get('/photos', requireRole(['state', 'collector', 'block_viewer']), adminController.photos);
router.delete('/photos/:id', requireRole(['state', 'collector']), adminController.deletePhoto);

// Reports
router.get('/reports', adminController.reports);

// Settings (Admin only)
router.get('/settings', requireRole('admin'), adminController.settings);

// Login History & Sessions (State can view any user, others can view their own)
router.get('/login-history', authController.getLoginHistory);
router.get('/active-sessions', authController.getActiveSessions);

// API endpoints for dynamic loading
router.get('/api/blocks', adminController.getBlocksByDistrict);
router.get('/api/hospitals-by-block', adminController.getHospitalsByBlock);
router.get('/api/mother-photo-stats', adminController.getMotherPhotoStats);

module.exports = router;
