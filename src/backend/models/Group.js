const mongoose = require('mongoose');
const { getConnections } = require('../config/database');

/* Vamos separar no mesmo model, membros e grupos */
const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    role: {
      type: String, //aparentemente assim pegaremos o cache do nome, o que é melhor para performance
      enum: ['admin', 'member'],
      default: 'member',
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // não criar um _id para cada membro, pois eles já terão o userId como referência única
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Descrição deve ter no máximo 300 caracteres'],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    members: {
      type: [memberSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

groupSchema.index({ 'members.userId': 1 }); // Índice para otimizar consultas por membro

/* Aqui nós definimos a conexão e o modelo do grupo */
const getGroupModel = () => {
  const groupConnection = getConnections('group');

  return groupConnection.models.Group || groupConnection.model('Group', groupSchema, 'groups');
};

module.exports = getGroupModel;
