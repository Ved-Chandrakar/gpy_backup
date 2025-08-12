const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const auth = require('../middleware/auth');
const motherPhotoUpload = require('../config/motherPhotoUpload');

// Routes
router.get('/dashboard', auth, hospitalController.getDashboard);
router.post('/new-mother-registration', auth, hospitalController.upload.fields([
  { name: 'delivery_document', maxCount: 1 },
  { name: 'mother_photo', maxCount: 1 },
  { name: 'photo', maxCount: 1 } // Fallback for single photo uploads
]), hospitalController.registerNewMother);
router.get('/mothers', auth, hospitalController.getMothersList);
router.get('/mothers/:child_id', auth, hospitalController.getMotherInfo);

// Mother photos routes - Certificate aur Plant Distribution Photos
router.post('/mothers/:child_id/photos', auth, motherPhotoUpload.fields([
  { name: 'certificate', maxCount: 5 },           // Birth Certificate, Discharge Papers etc
  { name: 'plant_distribution', maxCount: 5 }     // Mother+Child+Plant Photos
]), hospitalController.uploadMotherPhotos);
router.get('/mothers/:child_id/photos', auth, hospitalController.getMotherPhotos);

module.exports = router;
