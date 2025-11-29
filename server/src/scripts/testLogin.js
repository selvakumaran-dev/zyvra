const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Employee = require('../models/Employee');

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).populate('employee');
        console.log(`Found ${users.length} users in database:\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Employee: ${user.employee ? user.employee.firstName + ' ' + user.employee.lastName : 'N/A'}`);
            console.log(`   Active: ${user.isActive}`);
            console.log('');
        });

        // Test login with HR credentials
        console.log('Testing HR login...');
        const testEmail = 'hr@zyvra.com';
        const testPassword = 'password123';

        const hrUser = await User.findOne({ email: testEmail });
        if (hrUser) {
            const isMatch = await hrUser.comparePassword(testPassword);
            console.log(`HR Login Test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
            console.log(`Email in DB: "${hrUser.email}"`);
            console.log(`Password hash exists: ${!!hrUser.password}`);
        } else {
            console.log('❌ HR user not found');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testLogin();
