const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Job = require('../models/Job');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // 1. Total Employees
        const totalEmployees = await Employee.countDocuments({ status: 'Active' });

        // Calculate employee growth - compare current month vs last month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const lastMonthCount = await Employee.countDocuments({
            status: 'Active',
            createdAt: { $lte: lastMonthEnd }
        });

        const employeeGrowth = lastMonthCount > 0
            ? `${((totalEmployees - lastMonthCount) / lastMonthCount * 100).toFixed(1)}%`
            : '0%';

        // 2. Active Recruitments (Open Jobs)
        const activeRecruitments = await Job.countDocuments({ status: 'Open' });

        // Calculate recruitment change
        const lastMonthJobs = await Job.countDocuments({
            status: 'Open',
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        const recruitmentChange = lastMonthJobs > 0
            ? `${activeRecruitments - lastMonthJobs > 0 ? '+' : ''}${activeRecruitments - lastMonthJobs}`
            : '0';

        // 3. Payroll Cost (Sum of netPay for current month)
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const payrolls = await Payroll.find({
            month: currentMonth,
            year: currentYear
        });
        const totalPayrollCost = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);

        // Calculate payroll change
        const lastMonthPayrolls = await Payroll.find({
            month: currentMonth === 1 ? 12 : currentMonth - 1,
            year: currentMonth === 1 ? currentYear - 1 : currentYear
        });
        const lastMonthPayroll = lastMonthPayrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
        const payrollChange = lastMonthPayroll > 0
            ? `${((totalPayrollCost - lastMonthPayroll) / lastMonthPayroll * 100).toFixed(1)}%`
            : '0%';

        // Format currency
        const formattedPayroll = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(totalPayrollCost);

        // 4. Attrition Rate - Calculate from inactive employees
        const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });
        const totalEverEmployees = await Employee.countDocuments();
        const attritionRate = totalEverEmployees > 0
            ? `${(inactiveEmployees / totalEverEmployees * 100).toFixed(1)}%`
            : '0%';

        // Calculate attrition change
        const lastMonthInactive = await Employee.countDocuments({
            status: 'Inactive',
            updatedAt: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        const attritionChange = `-${lastMonthInactive}`;

        res.json({
            success: true,
            data: {
                stats: [
                    {
                        label: 'Total Employees',
                        value: totalEmployees.toString(),
                        change: employeeGrowth,
                        trend: parseFloat(employeeGrowth) >= 0 ? 'up' : 'down',
                        color: '#3B82F6'
                    },
                    {
                        label: 'Active Recruitments',
                        value: activeRecruitments.toString(),
                        change: recruitmentChange,
                        trend: parseInt(recruitmentChange) >= 0 ? 'up' : 'down',
                        color: '#10B981'
                    },
                    {
                        label: 'Attrition Rate',
                        value: attritionRate,
                        change: attritionChange,
                        trend: 'down',
                        color: '#F59E0B'
                    },
                    {
                        label: 'Payroll Cost',
                        value: formattedPayroll,
                        change: payrollChange,
                        trend: parseFloat(payrollChange) >= 0 ? 'up' : 'down',
                        color: '#EF4444'
                    }
                ]
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

// Get applicant dashboard statistics (public stats for job seekers)
router.get('/applicant-stats', auth, async (req, res) => {
    try {
        // 1. Total Employees
        const totalEmployees = await Employee.countDocuments({ status: 'Active' });

        // Calculate employee growth - compare current month vs last month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const lastMonthCount = await Employee.countDocuments({
            status: 'Active',
            createdAt: { $lte: lastMonthEnd }
        });

        const employeeGrowth = lastMonthCount > 0
            ? ((totalEmployees - lastMonthCount) / lastMonthCount * 100).toFixed(1)
            : 0;

        // 2. Active Recruitments (Open Jobs)
        const activeRecruitments = await Job.countDocuments({ status: 'Open' });

        // Calculate recruitment change
        const lastMonthJobs = await Job.countDocuments({
            status: 'Open',
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        const recruitmentChange = activeRecruitments - lastMonthJobs;

        res.json({
            success: true,
            data: {
                stats: [
                    {
                        label: 'Total Employees',
                        value: totalEmployees.toString(),
                        change: `${employeeGrowth}%`,
                        trend: employeeGrowth >= 0 ? 'up' : 'down',
                        color: '#3B82F6',
                        icon: 'users'
                    },
                    {
                        label: 'Employee Growth',
                        value: `${employeeGrowth}%`,
                        change: `vs last month`,
                        trend: employeeGrowth >= 0 ? 'up' : 'down',
                        color: '#10B981',
                        icon: 'trending-up'
                    },
                    {
                        label: 'Active Recruitments',
                        value: activeRecruitments.toString(),
                        change: `${recruitmentChange >= 0 ? '+' : ''}${recruitmentChange} this month`,
                        trend: recruitmentChange >= 0 ? 'up' : 'down',
                        color: '#F59E0B',
                        icon: 'briefcase'
                    }
                ]
            }
        });

    } catch (error) {
        console.error('Applicant dashboard stats error:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

// Get employee growth trend (last 6 months)
router.get('/charts/employee-growth', auth, async (req, res) => {
    try {
        const now = new Date();
        const data = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Get data for last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const count = await Employee.countDocuments({
                status: 'Active',
                createdAt: { $lte: nextMonth }
            });

            data.push({
                name: monthNames[date.getMonth()],
                employees: count
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

// Get department distribution
router.get('/charts/department-distribution', auth, async (req, res) => {
    try {
        const employees = await Employee.find({ status: 'Active' });
        const departmentCounts = {};

        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });

        const data = Object.entries(departmentCounts).map(([name, value]) => ({
            name,
            value
        }));

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

// Get attendance overview (last 7 days)
router.get('/charts/attendance-overview', auth, async (req, res) => {
    try {
        const now = new Date();
        const data = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get data for last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const presentCount = await Attendance.countDocuments({
                date: { $gte: date, $lt: nextDay },
                status: { $in: ['Present', 'Late', 'Half Day'] }
            });

            const absentCount = await Attendance.countDocuments({
                date: { $gte: date, $lt: nextDay },
                status: 'Absent'
            });

            data.push({
                name: dayNames[date.getDay()],
                present: presentCount,
                absent: absentCount
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

// Get recruitment funnel
router.get('/charts/recruitment-funnel', auth, async (req, res) => {
    try {
        const statuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
        const data = [];

        for (const status of statuses) {
            const count = await Candidate.countDocuments({ status });
            data.push({
                name: status === 'Interview' ? 'Interviews' :
                    status === 'Applied' ? 'Applications' :
                        status === 'Offer' ? 'Offers' : status,
                value: count
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
    }
});

module.exports = router;
