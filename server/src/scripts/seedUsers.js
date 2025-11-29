const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Employee = require('../models/Employee');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
};

const seedUsers = async () => {
    try {
        console.log('🗑️  Clearing existing users...');
        await User.deleteMany({});

        // Find HR Manager (Emily Watson)
        const hrEmployee = await Employee.findOne({ designation: 'HR Manager' });
        if (!hrEmployee) {
            console.error('❌ HR Manager not found. Please seed employees first.');
            return;
        }

        // Create HR User
        console.log('👤 Creating HR user...');
        await User.create({
            email: 'hr@zyvra.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'HR',
            employee: hrEmployee._id
        });

        // Find a regular employee (Sarah Chen)
        const regularEmployee = await Employee.findOne({ firstName: 'Sarah' });
        if (regularEmployee) {
            console.log('👤 Creating Employee user...');
            await User.create({
                email: 'sarah@zyvra.com',
                password: 'password123',
                role: 'Employee',
                employee: regularEmployee._id
            });
        }

        console.log('✅ Users seeded successfully!');
        console.log('   🔑 HR Login: hr@zyvra.com / password123');
        console.log('   🔑 Employee Login: sarah@zyvra.com / password123');

    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
    }
};

const run = async () => {
    await connectDB();
    await seedUsers();
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
};

run();
