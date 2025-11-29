const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half Day', 'Late'],
        default: 'Present'
    },
    totalHours: {
        type: Number,
        default: 0
    },
    location: {
        type: String, // e.g., "Office", "Remote"
        default: "Office"
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
