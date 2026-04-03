const mongoose = require('mongoose');
const { getConnections } = require('../config/database');
const { expense } = getConnections();

const splitDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  }, //usado para Igual
  percentage: {
    type: Number,
    default: 0,
  }, //usado para Porcentagem
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
    default: null,
  },
});

const ExpenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'Group',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: [0, 'Valor deve ser positivo'],
    },
    paidByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Divisão da Despesa
    splitType: {
      type: String, //"Igual", "Porcentagem" e "Exato"
      required: [true, 'Tipo de Divisão é obrigatório'],
      enum: ['igual', 'porcentagem', 'exato'],
    },
    splitDetails: [splitDetailSchema], //Detalhes de como a despesa foi dividida entre os membros
    receiptImage: {
      type: String, //Url da imagem do comprovante
      default: null,
      category: ['alimentação', 'transporte', 'hospedagem', 'moradia', 'outros'],
    },
    //createdAt: {
    //type: Date,
    //default: Date.now,
    //},
  },
  { timestamps: true }
);

ExpenseSchema.index({ group: 1, createdAt: -1 });
ExpenseSchema.index({ paidByUserId: 1 });

module.exports = expense.model('Expense', ExpenseSchema, 'expenses');
