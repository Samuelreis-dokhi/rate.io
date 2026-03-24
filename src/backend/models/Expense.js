const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
    },
    amount: {
        type: Number,
        required: true,
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Divisão da Despesa
    splitType: {
        type: String, //"Igual", "Porcentagem" e "Exato"
        required: [true, 'Tipo de Divisão é obrigatório'],
    },
    splitDetails: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            amount: {type: Number}, //usado para Igual
            percentage: {type: Number}, //usado para Porcentagem
        },
    ],
    receiptImage: {
        type: String, //Url da imagem do comprovante
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Expense', ExpenseSchema)