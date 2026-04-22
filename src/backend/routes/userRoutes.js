const express = require('express');
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  getPublicProfile,
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/', authenticateToken, createProfile);
router.get('/:userId', getPublicProfile);

module.exports = router;
