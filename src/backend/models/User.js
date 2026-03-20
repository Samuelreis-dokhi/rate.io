const mongoose = require('mongoose');
const { getConnections } = require('../config/database');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: [true, 'O ID de autenticação é obrigatório'],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Método para buscar usuário pelo authId
userSchema.statics.findByAuthId = function (authId) {
  return this.findOne({ authId, isActive: true });
};

const { user } = getConnections();

module.exports = user.model('User', userSchema, 'user_profiles');
