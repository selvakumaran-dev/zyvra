const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'LOGIN', 'VIEW_SALARY', 'DELETE_USER'
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    target: { type: String }, // e.g., 'Employee:123'
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['Success', 'Failure'], default: 'Success' },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
