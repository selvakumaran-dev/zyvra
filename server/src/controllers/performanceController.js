const Goal = require('../models/Goal');
const Review = require('../models/Review');

// --- GOALS ---

// Helper to check for expired goals
const checkAndProcessGoalExpirations = async () => {
    const now = new Date();

    // 1. Mark overdue goals as 'Failed'
    // Find goals that are past due date, not completed, and not already failed
    await Goal.updateMany(
        {
            dueDate: { $lt: now },
            status: { $nin: ['Completed', 'Failed'] }
        },
        {
            $set: {
                status: 'Failed',
                failedAt: now
            }
        }
    );

    // 2. Delete goals that have been 'Failed' for more than 24 hours
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
    await Goal.deleteMany({
        status: 'Failed',
        failedAt: { $lt: twentyFourHoursAgo }
    });
};

exports.getAllGoals = async (req, res) => {
    try {
        // Run expiration check before fetching
        await checkAndProcessGoalExpirations();

        const goals = await Goal.find().populate('employee', 'firstName lastName');

        // Group team goals by teamId
        const teamGoalsMap = new Map();
        const individualGoals = [];

        goals.forEach(goal => {
            if (goal.type === 'Team' && goal.teamId) {
                if (!teamGoalsMap.has(goal.teamId)) {
                    teamGoalsMap.set(goal.teamId, []);
                }
                teamGoalsMap.get(goal.teamId).push(goal);
            } else {
                individualGoals.push(goal);
            }
        });

        // For team goals, create a single goal object with average progress
        const teamGoals = Array.from(teamGoalsMap.values()).map(teamGroup => {
            const avgProgress = Math.round(
                teamGroup.reduce((sum, g) => sum + g.progress, 0) / teamGroup.length
            );

            // Determine status based on average progress
            let avgStatus = 'Not Started';
            if (avgProgress === 100) avgStatus = 'Completed';
            else if (avgProgress >= 50) avgStatus = 'In Progress';
            else if (avgProgress > 0) avgStatus = 'At Risk';

            // Use the first goal as template and add team member info
            const firstGoal = teamGroup[0];
            return {
                ...firstGoal.toObject(),
                progress: avgProgress,
                status: avgStatus,
                employee: {
                    firstName: `Team (${teamGroup.length} members)`,
                    lastName: ''
                },
                teamMembers: teamGroup.map(g => ({
                    employee: g.employee,
                    progress: g.progress,
                    status: g.status
                }))
            };
        });

        res.json({ data: [...individualGoals, ...teamGoals] });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const newGoal = new Goal(req.body);
        const savedGoal = await newGoal.save();

        // Populate employee details for notification
        await savedGoal.populate('employee', 'firstName lastName');

        // Create notification for the assigned employee
        if (savedGoal.employee) {
            const Notification = require('../models/Notification');

            const dueDate = new Date(savedGoal.dueDate).toLocaleDateString();

            const notificationData = {
                userId: savedGoal.employee._id,
                type: 'info',
                title: 'New Goal Assigned',
                message: `You have been assigned a new ${savedGoal.type.toLowerCase()} goal: "${savedGoal.title}". Due date: ${dueDate}`,
                icon: 'target',
                link: '/performance',
                priority: 'high',
                metadata: {
                    goalId: savedGoal._id,
                    goalTitle: savedGoal.title,
                    goalType: savedGoal.type,
                    dueDate: savedGoal.dueDate,
                    status: savedGoal.status
                }
            };

            await Notification.createNotification(notificationData);
            console.log(`✅ Goal assignment notification created for ${savedGoal.employee.firstName} ${savedGoal.employee.lastName}`);
        }

        res.status(201).json({ data: savedGoal });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(400).json({ error: { message: error.message } });
    }
};

// --- REVIEWS ---

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('employee', 'firstName lastName designation department')
            .populate('reviewer', 'firstName lastName')
            .sort({ createdAt: -1 }); // Most recent first
        res.json({ data: reviews });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createReview = async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json({ data: savedReview });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};



// Get goals for a specific employee
exports.getEmployeeGoals = async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('Fetching goals for employee ID:', employeeId);

        // Run expiration check before fetching
        await checkAndProcessGoalExpirations();

        const goals = await Goal.find({ employee: employeeId })
            .populate('employee', 'firstName lastName designation')
            .sort({ createdAt: -1 });

        console.log(`Found ${goals.length} goals for employee ${employeeId}`);
        goals.forEach(g => console.log(`  - Goal: ${g.title}, Employee: ${g.employee?._id}`));

        res.json({ data: goals });
    } catch (error) {
        console.error('Error fetching employee goals:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

// Update goal progress (for employees)
exports.updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress, status } = req.body;

        // If progress is 100%, delete the goal and notify HR
        if (progress === 100) {
            const deletedGoal = await Goal.findByIdAndDelete(id).populate('employee', 'firstName lastName');

            if (!deletedGoal) {
                return res.status(404).json({ error: { message: 'Goal not found' } });
            }

            // Notify all HR users about task completion
            const User = require('../models/User');
            const Notification = require('../models/Notification');

            const hrUsers = await User.find({ role: 'HR', isActive: true }).populate('employee');

            // Create notification for each HR user
            for (const hrUser of hrUsers) {
                if (hrUser.employee) {
                    const notificationData = {
                        userId: hrUser.employee._id,
                        type: 'success',
                        title: 'Task Completed',
                        message: `${deletedGoal.employee.firstName} ${deletedGoal.employee.lastName} has completed the goal: "${deletedGoal.title}"`,
                        icon: 'check-circle',
                        link: '/performance',
                        priority: 'medium',
                        metadata: {
                            goalId: deletedGoal._id,
                            goalTitle: deletedGoal.title,
                            employeeName: `${deletedGoal.employee.firstName} ${deletedGoal.employee.lastName}`,
                            completedAt: new Date()
                        }
                    };

                    await Notification.createNotification(notificationData);
                }
            }

            console.log(`✅ Task completion notification sent to ${hrUsers.length} HR user(s)`);

            return res.json({
                message: 'Goal completed and removed',
                data: { ...deletedGoal.toObject(), progress: 100, status: 'Completed' }
            });
        }

        // Otherwise, update normally
        const updatedGoal = await Goal.findByIdAndUpdate(
            id,
            { progress, status },
            { new: true }
        ).populate('employee', 'firstName lastName');

        if (!updatedGoal) {
            return res.status(404).json({ error: { message: 'Goal not found' } });
        }

        res.json({ data: updatedGoal });
    } catch (error) {
        console.error('Error updating goal progress:', error);
        res.status(400).json({ error: { message: error.message } });
    }
};
