const Employee = require('../models/Employee');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// Search across all modules
const globalSearch = async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        const searchQuery = q.trim();
        const searchLimit = parseInt(limit);

        // Search employees
        const employees = await Employee.find({
            $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
                { department: { $regex: searchQuery, $options: 'i' } },
                { position: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .limit(searchLimit)
            .select('firstName lastName email department position status')
            .lean();

        // Search candidates
        const candidates = await Candidate.find({
            $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
                { position: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .limit(searchLimit)
            .select('firstName lastName email position status')
            .lean();

        // Search jobs
        const jobs = await Job.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { department: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .limit(searchLimit)
            .select('title department status location')
            .lean();

        // Format results
        const results = {
            employees: employees.map(emp => ({
                id: emp._id,
                type: 'employee',
                title: `${emp.firstName} ${emp.lastName}`,
                subtitle: `${emp.position} - ${emp.department}`,
                url: `/employees/${emp._id}`,
                icon: 'user',
                status: emp.status
            })),
            candidates: candidates.map(cand => ({
                id: cand._id,
                type: 'candidate',
                title: `${cand.firstName} ${cand.lastName}`,
                subtitle: `${cand.position} - ${cand.status}`,
                url: `/recruitment?candidate=${cand._id}`,
                icon: 'user-check',
                status: cand.status
            })),
            jobs: jobs.map(job => ({
                id: job._id,
                type: 'job',
                title: job.title,
                subtitle: `${job.department} - ${job.location || 'Remote'}`,
                url: `/recruitment?job=${job._id}`,
                icon: 'briefcase',
                status: job.status
            }))
        };

        const totalResults = employees.length + candidates.length + jobs.length;

        res.json({
            success: true,
            data: results,
            meta: {
                query: searchQuery,
                totalResults,
                executionTime: `${Date.now() - req.startTime}ms`
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
};

// Get quick actions
const getQuickActions = (req, res) => {
    const actions = [
        {
            id: 'add-employee',
            title: 'Add Employee',
            subtitle: 'Create a new employee record',
            url: '/employees/create-account',
            icon: 'user-plus',
            category: 'create'
        },
        {
            id: 'post-job',
            title: 'Post Job',
            subtitle: 'Create a new job posting',
            url: '/recruitment',
            icon: 'briefcase',
            category: 'create'
        },
        {
            id: 'run-payroll',
            title: 'Run Payroll',
            subtitle: 'Process employee payroll',
            url: '/payroll',
            icon: 'dollar-sign',
            category: 'action'
        },
        {
            id: 'view-dashboard',
            title: 'Dashboard',
            subtitle: 'Go to main dashboard',
            url: '/',
            icon: 'layout-dashboard',
            category: 'navigate'
        },
        {
            id: 'view-employees',
            title: 'Employees',
            subtitle: 'View all employees',
            url: '/employees',
            icon: 'users',
            category: 'navigate'
        },
        {
            id: 'view-recruitment',
            title: 'Recruitment',
            subtitle: 'Manage recruitment',
            url: '/recruitment',
            icon: 'user-check',
            category: 'navigate'
        },
        {
            id: 'view-performance',
            title: 'Performance',
            subtitle: 'View performance reviews',
            url: '/performance',
            icon: 'trending-up',
            category: 'navigate'
        },
        {
            id: 'view-attendance',
            title: 'Attendance',
            subtitle: 'Track attendance',
            url: '/attendance',
            icon: 'calendar-check',
            category: 'navigate'
        }
    ];

    res.json({
        success: true,
        data: actions
    });
};

module.exports = {
    globalSearch,
    getQuickActions
};
