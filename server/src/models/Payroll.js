const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: {
        hra: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        special: { type: Number, default: 0 }
    },
    deductions: {
        tax: { type: Number, default: 0 },
        pf: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 }
    },
    netPay: { type: Number, required: true },
    currency: { type: String, default: 'USD' }, // USD, EUR, INR, etc.
    exchangeRate: { type: Number, default: 1 }, // Rate relative to base currency (USD)
    status: { type: String, enum: ['Draft', 'Processing', 'Paid'], default: 'Draft' },
    paymentDate: { type: Date },
    transactionId: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payroll', payrollSchema);
