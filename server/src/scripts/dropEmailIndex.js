const mongoose = require('mongoose');
const Employee = require('../models/Employee');
require('dotenv').config();

const dropEmailIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // Drop the unique index on email field
        try {
            await Employee.collection.dropIndex('email_1');
            console.log('✅ Dropped unique index on email field');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Index does not exist, skipping...');
            } else {
                throw error;
            }
        }

        console.log('🎉 Email field is now non-unique!');
        console.log('💡 You can now create new employees with emails from terminated employees');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dropEmailIndex();
