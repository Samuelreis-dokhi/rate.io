const mongoose = require('mongoose');

const connectDB = async (uri, dbName) => {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${dbName}`);
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB (${dbName}):`, error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
