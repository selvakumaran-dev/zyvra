const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'], default: 'Full-Time' },
    status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number }, // Base salary
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    avatar: { type: String }, // URL to avatar
    phoneNumber: { type: String },
    address: { type: String },
    leaveBalance: {
        casualLeave: { type: Number, default: 12 },
        sickLeave: { type: Number, default: 10 },
        earnedLeave: { type: Number, default: 18 },
        unpaidLeave: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
