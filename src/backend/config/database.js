const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const CONNECTION_TIMEOUT_MS = 10000;

let registry;

const getOrCreateRegistry = () => {
  if (registry) return registry;

  const requiredVars = ['MONGO_URI_AUTH', 'MONGO_URI_USERS'];
  for (const envKey of requiredVars) {
    if (!process.env[envKey]) {
      throw new Error(`Variável de ambiente obrigatória ausente: ${envKey}`);
    }
  }

  const auth = mongoose.createConnection(process.env.MONGO_URI_AUTH, {
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
  });

  const user = mongoose.createConnection(process.env.MONGO_URI_USERS, {
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
  });

  const group = process.env.MONGO_URI_GROUPS
    ? mongoose.createConnection(process.env.MONGO_URI_GROUPS, {
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
      })
    : null;

  const expense = process.env.MONGO_URI_EXPENSES
    ? mongoose.createConnection(process.env.MONGO_URI_EXPENSES, {
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
      })
    : null;

  registry = {
    auth,
    user,
    group,
    expense,
  };

  return registry;
};

const connectDatabases = async () => {
  const connections = getOrCreateRegistry();

  await connections.auth.asPromise();
  console.log('MongoDB conectado: auth_db');

  await connections.user.asPromise();
  console.log('MongoDB conectado: user_db');

  if (connections.group) {
    await connections.group.asPromise();
    console.log('MongoDB conectado: group_db');
  }

  if (connections.expense) {
    await connections.expense.asPromise();
    console.log('MongoDB conectado: expense_db');
  }
};

const getConnections = () => getOrCreateRegistry();

module.exports = {
  connectDatabases,
  getConnections,
};
