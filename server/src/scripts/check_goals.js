const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const Employee = require('../models/Employee');
require('dotenv').config();

const checkGoals = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-app');
        console.log('Connected to MongoDB');

        const goals = await Goal.find().populate('employee', 'firstName lastName');
        console.log(`Total goals found: ${goals.length}`);

        goals.forEach(g => {
            console.log(`Goal: "${g.title}" | Type: ${g.type} | Status: ${g.status} | Employee: ${g.employee ? `${g.employee.firstName} ${g.employee.lastName} (${g.employee._id})` : 'UNASSIGNED'} | TeamID: ${g.teamId || 'N/A'}`);
        });

        const employees = await Employee.find({}, 'firstName lastName email');
        console.log('\nAll Employees:');
        employees.forEach(e => {
            console.log(`${e.firstName} ${e.lastName} (${e._id}) - ${e.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkGoals();
