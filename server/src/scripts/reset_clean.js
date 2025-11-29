const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Payroll = require('../models/Payroll');
const AuditLog = require('../models/AuditLog');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
};

const resetDatabase = async () => {
    try {
        console.log('🗑️  Clearing all database collections...');

        await User.deleteMany({});
        await Employee.deleteMany({});
        await Job.deleteMany({});
        await Candidate.deleteMany({});
        await Payroll.deleteMany({});
        await AuditLog.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});

        console.log('✅ All data cleared.');

        console.log('👤 Creating initial HR Admin...');

        // 1. Create HR Employee Profile
        const hrEmployee = await Employee.create({
            firstName: 'System',
            lastName: 'Admin',
            email: 'hr@zyvra.com',
            phone: '000-000-0000',
            designation: 'HR Manager',
            department: 'Human Resources',
            type: 'Full-Time',
            status: 'Active',
            joiningDate: new Date(),
            salary: 0,
            address: {
                street: '123 Admin St',
                city: 'Tech City',
                state: 'TC',
                zipCode: '10001',
                country: 'USA'
            }
        });

        // 2. Create HR User Account
        // Password hashing is handled by the User model pre-save hook
        await User.create({
            email: 'hr@zyvra.com',
            password: 'password123',
            role: 'HR',
            employee: hrEmployee._id,
            isActive: true
        });

        console.log('✅ System Reset Complete!');
        console.log('------------------------------------------------');
        console.log('🔑 New HR Credentials:');
        console.log('   Email: hr@zyvra.com');
        console.log('   Password: password123');
        console.log('------------------------------------------------');
        console.log('🚀 You can now log in and start creating employees from scratch.');

    } catch (error) {
        console.error('❌ Reset Error:', error);
    }
};

const run = async () => {
    await connectDB();
    await resetDatabase();
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
};

run();
