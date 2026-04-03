const express = require('express');
const router = express.Router();
const { addExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:groupId/expenses', authMiddleware, addExpense);

module.exports = router;
