const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'], default: 'Full-Time' },
    status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
    description: { type: String },
    requirements: [{ type: String }],
    salaryRange: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' }
    },
    hiringManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
