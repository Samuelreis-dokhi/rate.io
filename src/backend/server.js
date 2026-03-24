const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDatabases } = require('./config/database');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste inicial
app.get('/', (req, res) => {
  res.send('API rodando...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// app.use('/api/expenses', require('./routes/expenseRoutes'));
// app.use('/api/groups', require('./routes/groupRoutes'));

const PORT = process.env.PORT || 3000;

// Inicia o servidor e conecta ao MongoDB
const startServer = async () => {
  try {
    await connectDatabases();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

startServer();
