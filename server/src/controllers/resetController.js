const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Review = require('../models/Review');
const Goal = require('../models/Goal');
const Job = require('../models/Job');
const Applicant = require('../models/Applicant');
const Candidate = require('../models/Candidate');
const Policy = require('../models/Policy');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Workflow = require('../models/Workflow');
const WorkflowLog = require('../models/WorkflowLog');
const Report = require('../models/Report');
const logger = require('../config/logger');

/**
 * Reset Database - Delete all data except HR admin account
 * This is a destructive operation that cannot be undone
 */
const resetDatabase = async (req, res) => {
    try {
        logger.info('Database reset initiated by user:', req.user.email);

        // Find HR admin user(s) - users with role 'HR'
        const hrUsers = await User.find({ role: 'HR' });

        if (hrUsers.length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'No HR admin account found. Reset aborted.' }
            });
        }

        const hrUserIds = hrUsers.map(u => u._id);
        const hrEmployeeIds = hrUsers
            .filter(u => u.employee)
            .map(u => u.employee);

        // Delete all data except HR admin
        const deletionResults = {
            users: 0,
            employees: 0,
            attendance: 0,
            leaves: 0,
            payroll: 0,
            reviews: 0,
            goals: 0,
            jobs: 0,
            applicants: 0,
            candidates: 0,
            policies: 0,
            documents: 0,
            notifications: 0,
            auditLogs: 0,
            workflows: 0,
            workflowLogs: 0,
            reports: 0
        };

        // Delete users (except HR admins)
        const userResult = await User.deleteMany({
            _id: { $nin: hrUserIds }
        });
        deletionResults.users = userResult.deletedCount;

        // Delete employees (except those linked to HR admins)
        const employeeResult = await Employee.deleteMany({
            _id: { $nin: hrEmployeeIds }
        });
        deletionResults.employees = employeeResult.deletedCount;

        // Delete all attendance records
        const attendanceResult = await Attendance.deleteMany({});
        deletionResults.attendance = attendanceResult.deletedCount;

        // Delete all leave applications
        const leaveResult = await Leave.deleteMany({});
        deletionResults.leaves = leaveResult.deletedCount;

        // Delete all payroll records
        const payrollResult = await Payroll.deleteMany({});
        deletionResults.payroll = payrollResult.deletedCount;

        // Delete all performance reviews
        const reviewResult = await Review.deleteMany({});
        deletionResults.reviews = reviewResult.deletedCount;

        // Delete all goals
        const goalResult = await Goal.deleteMany({});
        deletionResults.goals = goalResult.deletedCount;

        // Delete all job postings
        const jobResult = await Job.deleteMany({});
        deletionResults.jobs = jobResult.deletedCount;

        // Delete all applicants
        const applicantResult = await Applicant.deleteMany({});
        deletionResults.applicants = applicantResult.deletedCount;

        // Delete all candidates
        const candidateResult = await Candidate.deleteMany({});
        deletionResults.candidates = candidateResult.deletedCount;

        // Delete all policies
        const policyResult = await Policy.deleteMany({});
        deletionResults.policies = policyResult.deletedCount;

        // Delete all documents
        const documentResult = await Document.deleteMany({});
        deletionResults.documents = documentResult.deletedCount;

        // Delete all notifications
        const notificationResult = await Notification.deleteMany({});
        deletionResults.notifications = notificationResult.deletedCount;

        // Delete all audit logs
        const auditLogResult = await AuditLog.deleteMany({});
        deletionResults.auditLogs = auditLogResult.deletedCount;

        // Delete all workflows
        const workflowResult = await Workflow.deleteMany({});
        deletionResults.workflows = workflowResult.deletedCount;

        // Delete all workflow logs
        const workflowLogResult = await WorkflowLog.deleteMany({});
        deletionResults.workflowLogs = workflowLogResult.deletedCount;

        // Delete all reports
        const reportResult = await Report.deleteMany({});
        deletionResults.reports = reportResult.deletedCount;

        logger.info('Database reset completed successfully', deletionResults);

        res.json({
            success: true,
            data: {
                message: 'Database reset successfully. All data deleted except HR admin account(s).',
                deletedRecords: deletionResults,
                preservedHRAccounts: hrUsers.length
            }
        });

    } catch (error) {
        logger.error('Database reset failed:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Database reset failed',
                details: error.message
            }
        });
    }
};

module.exports = {
    resetDatabase
};
