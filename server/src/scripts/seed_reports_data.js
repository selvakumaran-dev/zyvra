const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zyvra');
        console.log('✅ Connected to MongoDB\n');

        // Get existing employees
        const employees = await Employee.find();
        console.log(`Found ${employees.length} employees\n`);

        if (employees.length === 0) {
            console.log('❌ No employees found. Please run employee seed first.');
            process.exit(1);
        }

        // Clear existing data
        await Payroll.deleteMany({});
        await Candidate.deleteMany({});
        await Job.deleteMany({});
        console.log('🗑️  Cleared existing payroll, candidates, and jobs\n');

        // Create Payroll Records (last 6 months)
        const payrollRecords = [];
        const currentDate = new Date();

        for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - monthOffset);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            for (const emp of employees) {
                const basicSalary = emp.salary || 50000;
                const hra = basicSalary * 0.4;
                const da = basicSalary * 0.12;
                const grossSalary = basicSalary + hra + da;
                const pf = basicSalary * 0.12;
                const tax = grossSalary * 0.1;
                const totalDeductions = pf + tax;
                const netSalary = grossSalary - totalDeductions;

                payrollRecords.push({
                    employee: emp._id,
                    month,
                    year,
                    basicSalary,
                    allowances: {
                        hra,
                        da,
                        transport: 2000,
                        medical: 1500
                    },
                    deductions: {
                        pf,
                        tax,
                        insurance: 500
                    },
                    grossSalary,
                    totalDeductions,
                    netPay: netSalary,
                    status: monthOffset === 0 ? 'Processing' : 'Paid',
                    paymentDate: monthOffset === 0 ? null : new Date(year, month - 1, 28)
                });
            }
        }

        await Payroll.insertMany(payrollRecords);
        console.log(`✅ Created ${payrollRecords.length} payroll records\n`);

        // Create Jobs
        const jobs = await Job.create([
            {
                title: 'Senior Software Engineer',
                department: 'Engineering',
                location: 'Remote',
                type: 'Full-Time',
                experience: '5-7 years',
                salary: { min: 80000, max: 120000 },
                description: 'Looking for an experienced software engineer',
                requirements: ['React', 'Node.js', 'MongoDB'],
                status: 'Open',
                postedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Product Manager',
                department: 'Product',
                location: 'Hybrid',
                type: 'Full-Time',
                experience: '3-5 years',
                salary: { min: 90000, max: 130000 },
                description: 'Seeking a product manager to lead our team',
                requirements: ['Product Strategy', 'Agile', 'Stakeholder Management'],
                status: 'Open',
                postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'UX Designer',
                department: 'Design',
                location: 'On-site',
                type: 'Full-Time',
                experience: '2-4 years',
                salary: { min: 60000, max: 85000 },
                description: 'Creative UX designer needed',
                requirements: ['Figma', 'User Research', 'Prototyping'],
                status: 'Closed',
                postedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log(`✅ Created ${jobs.length} jobs\n`);

        // Create Candidates
        const candidates = [];
        const statuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Hired'];
        const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

        for (let i = 0; i < 15; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            candidates.push({
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
                phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                jobId: job._id,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                experience: Math.floor(Math.random() * 10) + 1,
                expectedSalary: Math.floor(Math.random() * 50000) + 60000,
                skills: ['JavaScript', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 1),
                appliedDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
            });
        }

        await Candidate.insertMany(candidates);
        console.log(`✅ Created ${candidates.length} candidates\n`);

        // Create Reviews (Performance Data)
        const Review = require('../models/Review');
        await Review.deleteMany({});

        const reviews = [];
        const cycles = ['Q3 2025', 'Q4 2025'];

        for (const emp of employees) {
            // Self Review
            reviews.push({
                employee: emp._id,
                reviewer: emp._id,
                cycle: 'Q4 2025',
                type: 'Self',
                status: 'Submitted',
                ratings: {
                    performance: Math.floor(Math.random() * 2) + 3, // 3-4
                    potential: Math.floor(Math.random() * 2) + 3,
                    values: Math.floor(Math.random() * 2) + 3
                },
                feedback: 'I have met most of my goals this quarter.',
                submittedAt: new Date()
            });

            // Manager Review (assign random manager from employees)
            const manager = employees.find(e => e._id.toString() !== emp._id.toString()) || emp;
            reviews.push({
                employee: emp._id,
                reviewer: manager._id,
                cycle: 'Q4 2025',
                type: 'Manager',
                status: 'Approved',
                ratings: {
                    performance: Math.floor(Math.random() * 3) + 3, // 3-5
                    potential: Math.floor(Math.random() * 3) + 3,
                    values: Math.floor(Math.random() * 3) + 3
                },
                feedback: 'Good performance overall.',
                submittedAt: new Date()
            });
        }

        await Review.insertMany(reviews);
        console.log(`✅ Created ${reviews.length} reviews\n`);

        // Summary
        console.log('📊 Database Summary:');
        console.log('==================');
        console.log(`Employees: ${employees.length}`);
        console.log(`Payroll Records: ${payrollRecords.length}`);
        console.log(`Jobs: ${jobs.length}`);
        console.log(`Candidates: ${candidates.length}`);
        console.log('\n✅ Data seeding complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedData();
