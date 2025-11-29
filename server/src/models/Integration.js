const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['slack', 'google_calendar', 'zoom', 'teams'],
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    config: {
        // Flexible config based on type
        apiKey: String,
        webhookUrl: String,
        clientId: String,
        clientSecret: String,
        accessToken: String,
        refreshToken: String,
        settings: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['connected', 'disconnected', 'error'],
        default: 'disconnected'
    },
    lastSyncAt: Date,
    connectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Integration', integrationSchema);
