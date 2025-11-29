const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees.`);

        for (const emp of employees) {
            const user = await User.findOne({ employee: emp._id });
            console.log(`- ${emp.firstName} ${emp.lastName} (${emp.email}): ${user ? '✅ Has Account' : '❌ No Account'}`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
