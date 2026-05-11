const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Define os caminhos dentro de /api/auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
