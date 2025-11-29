const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const createUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'selvaofficial1026@gmail.com';
        const employee = await Employee.findOne({ email });

        if (!employee) {
            console.log('Employee not found!');
            process.exit(1);
        }

        // Create user
        const user = await User.create({
            email: employee.email,
            password: 'password123', // Will be hashed by pre-save hook
            role: 'Employee',
            employee: employee._id,
            isActive: true
        });

        console.log('✅ User account created successfully!');
        console.log('Email:', user.email);
        console.log('Password:', 'password123');
        console.log('Role:', user.role);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createUser();
