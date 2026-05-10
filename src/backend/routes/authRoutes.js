const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define os caminhos dentro de /api/auth
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

// Trocar senha (protegido)
router.put('/change-password', authenticateToken, authController.changePassword);