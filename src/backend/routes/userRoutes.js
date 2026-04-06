const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createProfile);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
