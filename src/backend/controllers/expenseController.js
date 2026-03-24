const Expense = require('../models/Expense');
const Group = require('../models/Group');

const calculateSplit = (amount, splitType, splitDetails, members) => {
    let distributions = {};
    let totalCheck = 0;

    if (splitType == 'equal') {
        const perPerson = amount / members.lenght;
        members.forEach(member => {
            distributions[member.user.toString()] = perPerson
        });
    }
    else if (splitType == 'percentage') {
        let totalPercentage = 0;
        splitDetails.forEach(detail => {
            totalPercentage += detail.percentage;
            distributions[detail.user.toString()] =  amount * (detail.percentage / 100);
        });
        if (totalPercentage !== 100) throw new Error ('A soma das porcentagens deve ser 100%')
    }
    else if (splitType == 'exact') {
        splitDetails.forEach(detail => {
            totalCheck += detail.amount;
            distributions[detail.user.toString()] = detail.amount;
        });
        if (Math.abs(totalCheck - amount)) throw new Error ('A soma dos valores exatos não batem com o total')
    }
    return distributions;
};
