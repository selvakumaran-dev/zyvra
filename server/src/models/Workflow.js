const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    trigger: {
        type: {
            type: String,
            enum: ['event', 'schedule', 'manual'],
            required: true
        },
        config: {
            event: String, // e.g., 'employee.created'
            schedule: String, // cron expression
            conditions: [{
                field: String,
                operator: String,
                value: mongoose.Schema.Types.Mixed
            }]
        }
    },
    steps: [{
        id: String,
        type: {
            type: String,
            enum: ['action', 'condition', 'delay'],
            required: true
        },
        config: {
            action: String, // e.g., 'send_email', 'update_field'
            params: mongoose.Schema.Types.Mixed,
            condition: {
                field: String,
                operator: String,
                value: mongoose.Schema.Types.Mixed
            },
            delay: Number // in minutes
        },
        nextStepId: String,
        falseStepId: String // for conditions
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stats: {
        runs: { type: Number, default: 0 },
        success: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        lastRunAt: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);
