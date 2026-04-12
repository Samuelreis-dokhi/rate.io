const mongoose = require('mongoose');

const requiredDatabases = ['auth', 'user', 'expense', 'group'];
const connections = {};

const getMongoUris = () => {
  const singleUri = process.env.MONGO_URI;
  return {
    auth: process.env.MONGO_URI_AUTH || singleUri,
    user: process.env.MONGO_URI_USER || singleUri,
    expense: process.env.MONGO_URI_EXPENSES,
    group: process.env.MONGO_URI_GROUPS,
  };
};

const connectDB = async () => {
  const mongoUris = getMongoUris();

  for (const dbName of Object.keys(mongoUris)) {
    const uri = mongoUris[dbName];

    if (!uri) {
      if (requiredDatabases.includes(dbName)) {
        throw new Error(
          `URI para o banco de dados "${dbName}" não configurada. Variável de ambiente esperada: MONGO_URI_${dbName.toUpperCase()}`
        );
      }
      continue; // Pula bancos de dados opcionais
    }
    if (connections[dbName] && connections[dbName].readyState === 1) {
      continue; // Já conectado
    }

    const connection = mongoose.createConnection(uri, {
      maxPoolSize: 10,
    });

    await connection.asPromise();
    connections[dbName] = connection;
    console.log(`MongoDB conectado: ${dbName}`);
  }
};
const getConnections = (dbName) => {
  const connection = connections[dbName];
  if (!connection) {
    throw new Error(
      `Conexão para o banco de dados "${dbName}" não encontrada. Verifique a configuração e conexão.`
    );
  }
  return connection;
};

module.exports = {
  connectDB,
  getConnections,
};
