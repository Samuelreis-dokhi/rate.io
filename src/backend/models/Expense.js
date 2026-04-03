const mongoose = require('mongoose');
const { getConnection } = require('../config/database');

const splitDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    }, //usado para Igual
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    }, //usado para Porcentagem
    status: {
      type: String,
      enum: ['pendente', 'pago'],
      default: 'pendente',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      maxlength: [255, 'Descrição deve ter no máximo 255 caracteres'],
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: [0.01, 'Valor deve ser positivo'],
    },

    currency: {
      type: String,
      default: 'BRL',
      enum: ['BRL', 'USD'], // Adicione outras moedas conforme necessário
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    splits: {
      type: [splitDetailSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'A divisão da despesa deve conter pelo menos um detalhe',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Divisão da Despesa
    splitType: {
      type: String, //"Igual", "Porcentagem" e "Exato"
      enum: ['igual', 'porcentagem', 'exato'],
      default: 'igual',
    },
  },
  { timestamps: true }
);

expenseSchema.index({ groupId: 1, createdAt: -1 });

const expenseConnection = getConnection('expense');
const Expense =
  expenseConnection.models.Expense || expenseConnection.model('Expense', expenseSchema);

module.exports = Expense;
