const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../models/Employee');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ MongoDB Connected');

    await Employee.deleteMany({});
    console.log('🗑️  Cleared employees');

    const employees = await Employee.create([
        { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@zyvra.com', designation: 'Senior Engineer', department: 'Engineering', type: 'Full-Time', status: 'Active', salary: 95000, joiningDate: new Date('2023-01-15') },
        { firstName: 'Michael', lastName: 'Ross', email: 'michael.ross@zyvra.com', designation: 'Sales Manager', department: 'Sales', type: 'Full-Time', status: 'Active', salary: 85000, joiningDate: new Date('2022-06-10') },
        { firstName: 'Jennifer', lastName: 'Adams', email: 'jennifer.adams@zyvra.com', designation: 'Product Manager', department: 'Product', type: 'Full-Time', status: 'Active', salary: 98000, joiningDate: new Date('2021-03-20') },
        { firstName: 'David', lastName: 'Kim', email: 'david.kim@zyvra.com', designation: 'UX Designer', department: 'Design', type: 'Full-Time', status: 'Active', salary: 78000, joiningDate: new Date('2023-08-01') },
        { firstName: 'Emily', lastName: 'Watson', email: 'emily.watson@zyvra.com', designation: 'HR Manager', department: 'Human Resources', type: 'Full-Time', status: 'Active', salary: 82000, joiningDate: new Date('2022-11-15') },
        { firstName: 'Robert', lastName: 'Johnson', email: 'robert.johnson@zyvra.com', designation: 'DevOps Engineer', department: 'Engineering', type: 'Full-Time', status: 'Active', salary: 92000, joiningDate: new Date('2023-04-10') },
        { firstName: 'Lisa', lastName: 'Martinez', email: 'lisa.martinez@zyvra.com', designation: 'Marketing Specialist', department: 'Marketing', type: 'Full-Time', status: 'On Leave', salary: 68000, joiningDate: new Date('2024-01-05') }
    ]);

    console.log(`✅ Created ${employees.length} employees`);

    const Integration = require('../models/Integration');
    await Integration.deleteMany({});
    console.log('🗑️  Cleared integrations');

    await Integration.create({
        type: 'google_calendar',
        name: 'Google Calendar',
        status: 'connected',
        isEnabled: true,
        connectedBy: employees[0]._id, // Connect by first employee
        lastSyncAt: new Date()
    });
    console.log('✅ Created Google Calendar integration');
    await mongoose.connection.close();
    console.log('👋 Done');
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
