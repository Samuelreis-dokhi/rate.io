const express = require('express');
const { authenticateToken } = require('../../middleware/authMiddleware');
const path = require('node:path');

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

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  return app;
};

module.exports = { createApp };
