const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    leaveSettings: {
        casualLeave: { type: Number, default: 12 },
        sickLeave: { type: Number, default: 10 },
        earnedLeave: { type: Number, default: 18 },
        unpaidLeave: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
