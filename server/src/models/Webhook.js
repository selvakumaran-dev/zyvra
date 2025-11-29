const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    events: [{
        type: String,
        enum: ['employee.created', 'leave.approved', 'payroll.processed', 'recruitment.hired']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    secret: String, // For signature verification
    stats: {
        deliveries: { type: Number, default: 0 },
        failures: { type: Number, default: 0 },
        lastDeliveryAt: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Webhook', webhookSchema);
