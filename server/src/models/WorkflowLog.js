const mongoose = require('mongoose');

const workflowLogSchema = new mongoose.Schema({
    workflow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow',
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'running'],
        default: 'running'
    },
    triggerEvent: {
        type: String,
        required: true
    },
    steps: [{
        stepId: String,
        status: {
            type: String,
            enum: ['success', 'failed', 'skipped']
        },
        output: mongoose.Schema.Types.Mixed,
        executedAt: Date
    }],
    error: String,
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
});

module.exports = mongoose.model('WorkflowLog', workflowLogSchema);
