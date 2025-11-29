const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Contract', 'ID Proof', 'Tax', 'Resume', 'Other'],
        default: 'Other'
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
