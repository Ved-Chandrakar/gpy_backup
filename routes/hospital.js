const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const auth = require('../middleware/auth');

// Routes
router.get('/dashboard', auth, hospitalController.getDashboard);
router.post('/new-mother-registration', auth, hospitalController.upload.fields([
  { name: 'delivery_document', maxCount: 1 },
  { name: 'mother_photo', maxCount: 1 },
  { name: 'photo', maxCount: 1 } // Fallback for single photo uploads
]), hospitalController.registerNewMother);
router.get('/mothers', auth, hospitalController.getMothersList);
router.get('/mothers/:child_id', auth, hospitalController.getMotherInfo);

module.exports = router;
