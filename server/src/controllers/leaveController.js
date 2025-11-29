const Leave = require('../models/Leave');

exports.applyLeave = async (req, res) => {
    try {
        // Ensure user is linked to an employee record
        if (!req.user.employee) {
            return res.status(400).json({
                error: {
                    message: 'You must have an employee profile to apply for leave. Please contact HR.'
                }
            });
        }

        const leaveData = {
            ...req.body,
            employee: req.user.employee._id
        };
        const newLeave = new Leave(leaveData);
        const savedLeave = await newLeave.save();

        // Populate employee details for notification
        await savedLeave.populate('employee', 'firstName lastName');

        // Notify all HR users about the new leave request
        const User = require('../models/User');
        const Notification = require('../models/Notification');

        const hrUsers = await User.find({ role: 'HR', isActive: true }).populate('employee');

        const start = new Date(savedLeave.startDate).toLocaleDateString();
        const end = new Date(savedLeave.endDate).toLocaleDateString();

        // Create notification for each HR user
        for (const hrUser of hrUsers) {
            if (hrUser.employee) {
                const notificationData = {
                    userId: hrUser.employee._id,
                    type: 'info',
                    title: 'New Leave Request',
                    message: `${savedLeave.employee.firstName} ${savedLeave.employee.lastName} has applied for ${savedLeave.type} from ${start} to ${end}.`,
                    icon: 'calendar',
                    link: '/leave',
                    priority: 'medium',
                    metadata: {
                        leaveId: savedLeave._id,
                        employeeName: `${savedLeave.employee.firstName} ${savedLeave.employee.lastName}`,
                        leaveType: savedLeave.type,
                        startDate: savedLeave.startDate,
                        endDate: savedLeave.endDate
                    }
                };

                await Notification.createNotification(notificationData);
            }
        }

        console.log(`✅ Leave request notification sent to ${hrUsers.length} HR user(s)`);

        res.status(201).json({ data: savedLeave });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        let query = {};

        // If not HR, only show own leaves
        if (req.user.role !== 'HR') {
            if (!req.user.employee) {
                return res.json({ data: [] }); // No employee profile, no leaves
            }
            query = { employee: req.user.employee._id };
        }

        const leaves = await Leave.find(query)
            .populate('employee', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json({ data: leaves });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.updateLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason, status } = req.body;
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { type, startDate, endDate, reason, status },
            { new: true, runValidators: true }
        ).populate('employee', 'firstName lastName');

        if (!leave) {
            return res.status(404).json({ error: { message: 'Leave not found' } });
        }

        res.json({ data: leave });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findById(req.params.id).populate('employee', 'firstName lastName');

        if (!leave) {
            return res.status(404).json({ error: { message: 'Leave not found' } });
        }

        const oldStatus = leave.status;
        leave.status = status;

        // If approving, deduct from balance
        if (status === 'Approved' && oldStatus !== 'Approved') {
            const Employee = require('../models/Employee');
            const employee = await Employee.findById(leave.employee._id);

            if (employee) {
                // Calculate days (inclusive)
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const diffTime = Math.abs(end - start);
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                console.log(`Processing Leave Approval: ${days} days for ${leave.type}`);

                // Map leave type to schema field
                const typeMap = {
                    'Sick Leave': 'sickLeave',
                    'Casual Leave': 'casualLeave',
                    'Earned Leave': 'earnedLeave',
                    'Unpaid Leave': 'unpaidLeave'
                };

                const balanceField = typeMap[leave.type];
                if (balanceField) {
                    employee.leaveBalance[balanceField] -= days;
                    await employee.save();
                    console.log(`Updated balance for ${employee.firstName}: ${balanceField} = ${employee.leaveBalance[balanceField]}`);
                }
            }
        }

        await leave.save();

        // Create notification for employee when status changes
        if (oldStatus !== status && (status === 'Approved' || status === 'Rejected')) {
            const Notification = require('../models/Notification');

            const start = new Date(leave.startDate).toLocaleDateString();
            const end = new Date(leave.endDate).toLocaleDateString();

            const notificationData = {
                userId: leave.employee._id,
                type: status === 'Approved' ? 'success' : 'warning',
                title: `Leave Request ${status}`,
                message: `Your ${leave.type} request from ${start} to ${end} has been ${status.toLowerCase()}.`,
                icon: status === 'Approved' ? 'check-circle' : 'x-circle',
                link: '/leave',
                priority: 'high',
                metadata: {
                    leaveId: leave._id,
                    leaveType: leave.type,
                    startDate: leave.startDate,
                    endDate: leave.endDate,
                    status: status
                }
            };

            await Notification.createNotification(notificationData);
            console.log(`✅ Notification created for ${leave.employee.firstName} ${leave.employee.lastName}`);
        }

        res.json({ data: leave });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(400).json({ error: { message: error.message } });
    }
};
