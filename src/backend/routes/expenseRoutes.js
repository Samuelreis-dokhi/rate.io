const express = require('express');
const router = express.Router();

const {
  createExpense,
  getGroupExpenses,
  settleExpenseShare,
  getGroupBalances,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

router.post('/', createExpense);
router.get('/group/:groupId', getGroupExpenses);
router.post('/:expenseId/settle', settleExpenseShare);
router.get('/group/:groupId/balances', getGroupBalances);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
