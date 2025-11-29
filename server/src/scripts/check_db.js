const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/HR/server/.env' });
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ MongoDB Connected');

    const settings = await Settings.findOne();
    console.log('⚙️  Global Settings:', JSON.stringify(settings?.leaveSettings, null, 2));

    const kumar = await Employee.findOne({ firstName: { $regex: /kumar/i } });
    if (kumar) {
        console.log('👤 Kumar Balance:', JSON.stringify(kumar.leaveBalance, null, 2));
    } else {
        console.log('❌ Kumar not found');
    }

    const admin = await Employee.findOne({ designation: 'Senior Engineer' }); // Assuming Sarah is admin/first user
    if (admin) {
        console.log('👤 Admin (Sarah) Balance:', JSON.stringify(admin.leaveBalance, null, 2));
    }

    await mongoose.connection.close();
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
