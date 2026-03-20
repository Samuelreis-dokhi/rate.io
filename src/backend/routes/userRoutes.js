const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createProfile);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
