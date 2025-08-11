const express = require('express');
const router = express.Router();
const mitaninController = require('../controllers/mitaninController');
const auth = require('../middleware/auth');

// Routes
router.get('/dashboard', auth, mitaninController.getDashboard);
router.get('/pending-verification', auth, mitaninController.getPendingVerificationPhotos);
router.put('/verify-photo/:photo_id', auth, mitaninController.verifyPhoto);
router.get('/verification-photos', auth, mitaninController.getAllVerificationPhotos);
router.get('/mothers', auth, mitaninController.getMothersList);
router.get('/mothers/:child_id', auth, mitaninController.getMotherInfo);

module.exports = router;
