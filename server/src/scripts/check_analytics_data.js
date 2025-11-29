const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Candidate = require('../models/Candidate');
const Goal = require('../models/Goal');
const Job = require('../models/Job');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const employees = await Employee.countDocuments();
        const payrolls = await Payroll.countDocuments();
        const candidates = await Candidate.countDocuments();
        const goals = await Goal.countDocuments();
        const jobs = await Job.countDocuments();

        console.log('Data Counts:');
        console.log(`Employees: ${employees}`);
        console.log(`Payroll Records: ${payrolls}`);
        console.log(`Candidates: ${candidates}`);
        console.log(`Goals: ${goals}`);
        console.log(`Jobs: ${jobs}`);

        if (employees === 0 || payrolls === 0 || candidates === 0) {
            console.log('WARNING: Some collections are empty. Dashboard will be empty.');
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
