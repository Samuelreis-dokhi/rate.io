const express = require('express');
const { authenticateToken } = require('../../middleware/authMiddleware');

const createApp = () => {
  const app = express();
  app.use(express.json());

  // Rotas iguais ao server.js (auth pública)
  const authRoutes = require('../../routes/authRoutes');
  const userRoutes = require('../../routes/userRoutes');
  const groupRoutes = require('../../routes/groupRoutes');
  const expenseRoutes = require('../../routes/expenseRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/users', authenticateToken, userRoutes);
  app.use('/api/groups', authenticateToken, groupRoutes);
  app.use('/api/expenses', authenticateToken, expenseRoutes);

  return app;
};

module.exports = { createApp };
