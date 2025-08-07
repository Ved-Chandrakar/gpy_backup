const express = require('express');
const router = express.Router();
const motherController = require('../controllers/motherController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Mother management routes
router.post('/', authMiddleware, roleMiddleware('hospital'), motherController.registerMother);
router.get('/', authMiddleware, motherController.getMothers);
router.get('/:id', authMiddleware, motherController.getMotherById);
router.get('/:id/progress', authMiddleware, motherController.getMotherProgress);

module.exports = router;
