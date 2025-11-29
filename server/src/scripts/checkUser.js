const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'selvaofficial1026@gmail.com';

        // Check User
        const user = await User.findOne({ email });
        if (user) {
            console.log('✅ User Account Found:', email);
        } else {
            console.log('❌ User Account NOT Found:', email);
        }

        // Check Employee
        const employee = await Employee.findOne({ email });
        if (employee) {
            console.log('✅ Employee Record Found:', {
                name: `${employee.firstName} ${employee.lastName}`,
                email: employee.email,
                id: employee._id
            });
        } else {
            console.log('❌ Employee Record NOT Found:', email);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
