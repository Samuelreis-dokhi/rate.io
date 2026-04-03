const mongoose = require('mongoose');
const { GroupCategory } = require('../enums/groupCategory');

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String, //aparentemente assim pegaremos o cache do nome, o que é melhor para performance
      required: [true, 'Nome do membro é obrigatório'],
    },

    balance: {
      type: Number,
      default: 0,
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
    },

    icon: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      enum: Object.values(GroupCategory),
      required: [true, 'Categoria é obrigatória'],
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: {
      type: [memberSchema],
      // inserir validação para garantir que o admin seja sempre um membro do grupo
      // idealmente validar no service e avaliar proteção adicional no schema
      // algo do tipo:
      /*  validate: {
      validator: function (members) {
        if (!this.adminId) return true;

        return members.some(
          (m) => m.userId.toString() === this.adminId.toString()
        );
      },
      message: 'Admin deve estar entre os membros',
      */
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
