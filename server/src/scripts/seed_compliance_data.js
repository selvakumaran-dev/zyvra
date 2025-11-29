const mongoose = require('mongoose');
const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');
const Employee = require('../models/Employee');
require('dotenv').config();

const seedCompliance = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zyvra');
        console.log('✅ Connected to MongoDB');

        // Clear existing
        await Policy.deleteMany({});
        await AuditLog.deleteMany({});

        // Create Policies
        const policies = [
            {
                title: 'Employee Code of Conduct',
                version: '2.1',
                effectiveDate: '2025-01-01',
                status: 'Active',
                description: 'Guidelines for professional behavior and ethics.',
                category: 'Conduct',
                content: 'This policy outlines the expected behavior of all employees...'
            },
            {
                title: 'Data Privacy & Security',
                version: '1.5',
                effectiveDate: '2025-02-15',
                status: 'Active',
                description: 'Protocols for handling sensitive data and GDPR compliance.',
                category: 'Security',
                content: 'All employees must adhere to strict data privacy standards...'
            },
            {
                title: 'Remote Work Policy',
                version: '3.0',
                effectiveDate: '2025-03-01',
                status: 'Active',
                description: 'Rules and expectations for working from home.',
                category: 'HR',
                content: 'Remote work is a privilege that comes with responsibilities...'
            },
            {
                title: 'Anti-Harassment (POSH)',
                version: '1.2',
                effectiveDate: '2025-01-10',
                status: 'Active',
                description: 'Zero tolerance policy for harassment in the workplace.',
                category: 'Legal',
                content: 'We are committed to providing a safe and respectful work environment...'
            },
            {
                title: 'Travel & Expense Reimbursement',
                version: '2.0',
                effectiveDate: '2025-04-01',
                status: 'Draft',
                description: 'Guidelines for business travel and expense claims.',
                category: 'Finance',
                content: 'All business travel must be pre-approved...'
            }
        ];

        await Policy.insertMany(policies);
        console.log(`✅ Created ${policies.length} policies`);

        // Create Audit Logs
        const employees = await Employee.find().limit(5);
        const actions = ['LOGIN_SUCCESS', 'VIEW_PAYROLL', 'UPDATE_PROFILE', 'EXPORT_REPORT', 'VIEW_EMPLOYEE', 'LOGIN_FAILED'];
        const targets = ['System', 'Payroll', 'Profile', 'Reports', 'Employee:102', 'Settings'];

        const logs = [];
        for (let i = 0; i < 20; i++) {
            const randomEmp = employees[Math.floor(Math.random() * employees.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];

            logs.push({
                action,
                actor: randomEmp ? randomEmp._id : null,
                target: targets[Math.floor(Math.random() * targets.length)],
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                status: action.includes('FAILED') ? 'Failure' : 'Success',
                details: 'Automated system log',
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
            });
        }

        await AuditLog.insertMany(logs);
        console.log(`✅ Created ${logs.length} audit logs`);

        console.log('✅ Compliance data seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedCompliance();
