const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Candidate = require('../models/Candidate');
const Goal = require('../models/Goal');
const Job = require('../models/Job');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
    try {
        // Employee Statistics
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'Active' });
        const employeesByDepartment = await Employee.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Payroll Statistics
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const payrollStats = await Payroll.aggregate([
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: '$netPay' },
                    avgSalary: { $avg: '$netPay' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyPayroll = await Payroll.aggregate([
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    total: { $sum: '$netPay' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
        ]);

        // Recruitment Statistics
        const totalCandidates = await Candidate.countDocuments();
        const candidatesByStatus = await Candidate.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const activeJobs = await Job.countDocuments({ status: 'Open' });

        // Performance Statistics
        const totalGoals = await Goal.countDocuments();
        const completedGoals = await Goal.countDocuments({ status: 'Completed' });
        const goalStats = await Goal.aggregate([
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                    totalGoals: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                employees: {
                    total: totalEmployees,
                    active: activeEmployees,
                    byDepartment: employeesByDepartment
                },
                payroll: {
                    total: payrollStats[0]?.totalPaid || 0,
                    average: payrollStats[0]?.avgSalary || 0,
                    count: payrollStats[0]?.count || 0,
                    monthly: monthlyPayroll
                },
                recruitment: {
                    totalCandidates,
                    byStatus: candidatesByStatus,
                    activeJobs
                },
                performance: {
                    totalGoals,
                    completedGoals,
                    avgProgress: goalStats[0]?.avgProgress || 0,
                    completionRate: totalGoals > 0 ? (completedGoals / totalGoals * 100).toFixed(1) : 0
                }
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
};

// Overview Analytics
exports.getOverviewAnalytics = async (req, res) => {
    try {
        // Employee Stats
        const totalEmployees = await Employee.countDocuments();
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const newHires = await Employee.countDocuments({
            joiningDate: { $gte: currentMonthStart }
        });

        const departmentDistribution = await Employee.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        // Payroll Trends (Last 6 months)
        const payrollTrends = await Payroll.aggregate([
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    totalAmount: { $sum: '$netPay' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);

        // Recruitment Stats
        const totalCandidates = await Candidate.countDocuments();
        const activeJobs = await Job.countDocuments({ status: 'Open' });

        res.json({
            success: true,
            data: {
                employees: {
                    total: totalEmployees,
                    newHires,
                    departmentDistribution
                },
                payroll: {
                    trends: payrollTrends
                },
                recruitment: {
                    totalCandidates,
                    activeJobs
                }
            }
        });
    } catch (error) {
        console.error('Overview analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Performance Analytics
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const Review = require('../models/Review');

        // Rating Distribution
        const distribution = await Review.aggregate([
            {
                $group: {
                    _id: '$ratings.performance',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Performance by Department
        const byDepartment = await Review.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employee',
                    foreignField: '_id',
                    as: 'emp'
                }
            },
            { $unwind: '$emp' },
            {
                $group: {
                    _id: '$emp.department',
                    avgRating: { $avg: '$ratings.performance' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                distribution,
                byDepartment
            }
        });
    } catch (error) {
        console.error('Performance analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Attrition Analytics
exports.getAttritionAnalytics = async (req, res) => {
    try {
        // Mock attrition data since we don't have historical status changes
        // In a real app, we'd query an EmployeeHistory collection
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const trend = months.map(month => ({
            month,
            rate: Math.floor(Math.random() * 5) + 1 // Random rate 1-5%
        }));

        const byDepartment = await Employee.aggregate([
            { $match: { status: 'Terminated' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $project: { department: '$_id', count: 1, _id: 0 } }
        ]);

        res.json({
            success: true,
            data: {
                trend,
                byDepartment
            }
        });
    } catch (error) {
        console.error('Attrition analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
