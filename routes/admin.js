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

// Users Management (Admin, State, Collector/District)
router.get('/users', requireRole(['admin', 'state', 'collector']), adminController.users);
router.get('/users/hospitals', requireRole(['admin', 'state', 'collector']), adminController.hospitalUsers);
router.get('/users/mitanins', requireRole(['admin', 'state', 'collector']), adminController.mitaninUsers);
router.get('/users/new', requireRole(['admin', 'state', 'collector']), adminController.newUserForm);
router.post('/users/new', requireRole(['admin', 'state', 'collector']), adminController.createUser);
router.get('/users/:id/edit', requireRole(['admin', 'state', 'collector']), adminController.editUserForm);
router.post('/users/:id/edit', requireRole(['admin', 'state', 'collector']), adminController.updateUser);
router.get('/users/:id/details', requireRole(['admin', 'state', 'collector']), adminController.getUserDetails);

// Mothers Management
router.get('/mothers', adminController.mothers);
router.get('/mothers/export', adminController.exportMothers);
router.get('/mothers/:mobile/edit', adminController.editMotherForm);
router.post('/mothers/:mobile/edit', adminController.updateMother);

// Children Management
router.get('/children', adminController.children);
router.get('/children/:id', adminController.viewChild);
router.get('/children/:id/edit', adminController.editChildForm);
router.post('/children/:id/edit', adminController.updateChild);
router.get('/children/:id/tracking', adminController.childPlantTracking);
router.get('/children/:id/tracking', adminController.childPlantTracking); // Child tracking route

// Plants Management
router.get('/plants', adminController.plants);
router.get('/plants/add', adminController.addPlantForm);
router.post('/plants/add', plantImageUpload.single('plant_image'), adminController.createPlant);
router.get('/plants/:id/edit', adminController.editPlantForm);
router.post('/plants/:id/edit', plantImageUpload.single('plant_image'), adminController.updatePlant);
router.delete('/plants/:id', adminController.deletePlant);

// Plant Assignments
router.get('/assignments', adminController.assignments);
router.get('/assignments/new', adminController.newAssignmentForm);
router.post('/assignments/new', adminController.createAssignment);

// Plant Photos
router.get('/photos', adminController.photos);
router.delete('/photos/:id', adminController.deletePhoto);

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

module.exports = router;
