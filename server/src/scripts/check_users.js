const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-app');
        console.log('Connected to MongoDB');

        const users = await User.find().populate('employee', 'firstName lastName');
        console.log(`\nTotal users found: ${users.length}\n`);

        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log(`Active: ${u.isActive}`);
            console.log(`Employee: ${u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : 'N/A'}`);
            console.log(`Password Hash: ${u.password.substring(0, 20)}...`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
