const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    resume: {
        type: String, // File path or URL
    },
    linkedIn: {
        type: String,
        trim: true
    },
    portfolio: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    experience: {
        type: Number, // Years of experience
        default: 0
    },
    applications: [{
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interviewed', 'Rejected', 'Accepted'],
            default: 'Applied'
        },
        coverLetter: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for full name
applicantSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
applicantSchema.set('toJSON', { virtuals: true });
applicantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Applicant', applicantSchema);
