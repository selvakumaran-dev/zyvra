const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['tabular', 'summary', 'chart'],
        default: 'tabular'
    },
    dataSource: {
        type: String,
        required: true,
        enum: ['employees', 'payroll', 'recruitment', 'attendance', 'performance']
    },
    config: {
        fields: [String],
        filters: [{
            field: String,
            operator: String,
            value: mongoose.Schema.Types.Mixed
        }],
        sortBy: {
            field: String,
            order: { type: String, enum: ['asc', 'desc'], default: 'asc' }
        },
        groupBy: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    lastRunAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
