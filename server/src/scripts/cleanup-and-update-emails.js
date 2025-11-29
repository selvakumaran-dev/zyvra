const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../models/Employee');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ MongoDB Connected');

    try {
        // Find all employees
        const allEmployees = await Employee.find({});
        console.log(`📊 Total employees found: ${allEmployees.length}`);

        // Find HR employees (department: 'Human Resources' or 'HR')
        const hrEmployees = allEmployees.filter(emp =>
            emp.department && (
                emp.department.toLowerCase().includes('hr') ||
                emp.department.toLowerCase().includes('human resources')
            )
        );
        console.log(`👥 HR employees found: ${hrEmployees.length}`);

        // Get IDs of non-HR employees
        const nonHREmployees = allEmployees.filter(emp =>
            !emp.department || (
                !emp.department.toLowerCase().includes('hr') &&
                !emp.department.toLowerCase().includes('human resources')
            )
        );
        const nonHRIds = nonHREmployees.map(emp => emp._id);

        console.log(`🗑️  Non-HR employees to delete: ${nonHRIds.length}`);

        // Delete associated User accounts for non-HR employees
        if (nonHRIds.length > 0) {
            const deletedUsers = await User.deleteMany({
                employee: { $in: nonHRIds }
            });
            console.log(`🗑️  Deleted ${deletedUsers.deletedCount} user accounts`);

            // Delete non-HR employees
            const deletedEmployees = await Employee.deleteMany({
                _id: { $in: nonHRIds }
            });
            console.log(`🗑️  Deleted ${deletedEmployees.deletedCount} employee records`);
        }

        // Update email format for all remaining employees
        const remainingEmployees = await Employee.find({});
        console.log(`\n📧 Updating email format for ${remainingEmployees.length} remaining employees...`);

        for (const employee of remainingEmployees) {
            const newEmail = `${employee.firstName.toLowerCase()}@zyvra.com`;

            // Update employee email
            await Employee.findByIdAndUpdate(employee._id, {
                email: newEmail
            });

            // Update associated user email
            await User.updateOne(
                { employee: employee._id },
                { email: newEmail }
            );

            console.log(`✅ Updated: ${employee.firstName} ${employee.lastName} -> ${newEmail}`);
        }

        console.log('\n✅ Email format update complete!');
        console.log(`📊 Final employee count: ${remainingEmployees.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Done');
        process.exit(0);
    }
}).catch(err => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
});
