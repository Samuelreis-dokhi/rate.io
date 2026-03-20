const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexões com o banco de dados
connectDB(process.env.MONGO_URI_AUTH, 'auth');
connectDB(process.env.MONGO_URI_USERS, 'users');

app.get('/', (req, res) => {
  res.send('API rodando...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// app.use('/api/expenses', require('./routes/expenseRoutes'));
// app.use('/api/groups', require('./routes/groupRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});