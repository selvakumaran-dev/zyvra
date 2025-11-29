const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
        default: 'Applied'
    },
    resumeUrl: { type: String },
    skills: [{ type: String }],
    experience: { type: Number }, // Years of experience
    expectedSalary: { type: Number },
    score: { type: Number }, // AI/Rule-based score
    interviewDate: { type: Date },
    notes: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        text: { type: String },
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
