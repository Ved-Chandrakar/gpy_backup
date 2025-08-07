const express = require('express');
const router = express.Router();
const replacementController = require('../controllers/replacementController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Replacement request routes
router.post('/request-replacement', authMiddleware, roleMiddleware('mitanin', 'mother'), replacementController.submitReplacementRequest);
router.get('/replacement-requests', authMiddleware, replacementController.getReplacementRequests);
router.put('/replacement-requests/:id/review', authMiddleware, roleMiddleware('hospital', 'collector', 'state'), replacementController.reviewReplacementRequest);

module.exports = router;
