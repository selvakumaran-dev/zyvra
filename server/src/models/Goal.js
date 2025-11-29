const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['Individual', 'Team', 'Company'], default: 'Individual' },
    teamId: { type: String }, // For grouping team goals together
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'At Risk', 'Failed'], default: 'Not Started' },
    progress: { type: Number, default: 0 }, // 0-100
    dueDate: { type: Date },
    failedAt: { type: Date }, // Track when goal was marked as failed
    keyResults: [{
        title: { type: String },
        target: { type: Number },
        current: { type: Number, default: 0 },
        unit: { type: String } // e.g., '%', 'USD', 'Users'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
