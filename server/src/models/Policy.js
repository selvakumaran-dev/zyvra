const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    version: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Active', 'Archived'], default: 'Draft' },
    effectiveDate: { type: Date },
    requiredAck: { type: Boolean, default: true }, // Requires acknowledgement
    acknowledgements: [{
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);
