const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    cycle: { type: String, required: true }, // e.g., 'Q4 2025'
    type: { type: String, enum: ['Self', 'Manager', 'Peer'], required: true },
    status: { type: String, enum: ['Pending', 'Submitted', 'Approved'], default: 'Pending' },
    ratings: {
        performance: { type: Number, min: 1, max: 5 },
        potential: { type: Number, min: 1, max: 5 },
        values: { type: Number, min: 1, max: 5 }
    },
    feedback: { type: String },
    submittedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
