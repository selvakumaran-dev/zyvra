const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const resetUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-app');
        console.log('✅ Connected to MongoDB\n');

        // Get all employees
        const employees = await Employee.find();
        console.log(`Found ${employees.length} employees\n`);

        // Delete all existing users
        await User.deleteMany({});
        console.log('🗑️  Deleted all existing users\n');

        // Create users with known passwords
        const usersToCreate = [];

        // Create HR admin
        const systemAdmin = employees.find(e => e.email === 'system@zyvra.com');
        if (systemAdmin) {
            usersToCreate.push({
                email: 'system@zyvra.com',
                password: 'admin123',
                role: 'HR',
                employee: systemAdmin._id
            });
        }

        // Create employee users
        const selva = employees.find(e => e.email === 'selva@zyvra.com');
        if (selva) {
            usersToCreate.push({
                email: 'selva@zyvra.com',
                password: 'selva123',
                role: 'Employee',
                employee: selva._id
            });
        }

        const kumaran = employees.find(e => e.email === 'kumaran@zyvra.com');
        if (kumaran) {
            usersToCreate.push({
                email: 'kumaran@zyvra.com',
                password: 'kumaran123',
                role: 'Employee',
                employee: kumaran._id
            });
        }

        // Create users
        for (const userData of usersToCreate) {
            const user = await User.create(userData);
            console.log(`✅ Created user: ${user.email} (password: ${userData.password})`);
        }

        console.log('\n✅ All users reset successfully!');
        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log('HR Admin:');
        console.log('  Email: system@zyvra.com');
        console.log('  Password: admin123');
        console.log('\nEmployee (Selva):');
        console.log('  Email: selva@zyvra.com');
        console.log('  Password: selva123');
        console.log('\nEmployee (Kumaran):');
        console.log('  Email: kumaran@zyvra.com');
        console.log('  Password: kumaran123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetUsers();
