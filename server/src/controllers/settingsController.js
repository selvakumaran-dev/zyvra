const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({ data: settings });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            // Handle leaveSettings deep merge to prevent overwriting with defaults if partial data is sent
            if (req.body.leaveSettings) {
                settings.leaveSettings = {
                    ...settings.leaveSettings.toObject(),
                    ...req.body.leaveSettings
                };
                // Remove leaveSettings from req.body to avoid overwriting again with Object.assign
                delete req.body.leaveSettings;
            }
            Object.assign(settings, req.body);
        }
        await settings.save();

        // If leave settings were updated, sync to all employees
        if (req.body.leaveSettings) {
            const Employee = require('../models/Employee');
            const Leave = require('../models/Leave');

            console.log('🔄 Syncing global leave settings to all employees...');

            const employees = await Employee.find();
            const globalSettings = req.body.leaveSettings;

            for (const employee of employees) {
                // Calculate used leaves for this employee
                const leaves = await Leave.find({
                    employee: employee._id,
                    status: 'Approved'
                });

                let used = {
                    sickLeave: 0,
                    casualLeave: 0,
                    earnedLeave: 0,
                    unpaidLeave: 0
                };

                // Sum up duration of all approved leaves
                for (const leave of leaves) {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const diffTime = Math.abs(end - start);
                    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    const typeMap = {
                        'Sick Leave': 'sickLeave',
                        'Casual Leave': 'casualLeave',
                        'Earned Leave': 'earnedLeave',
                        'Unpaid Leave': 'unpaidLeave'
                    };

                    const key = typeMap[leave.type];
                    if (key) used[key] += days;
                }

                // Update balance: New Global Limit - Used
                employee.leaveBalance = {
                    sickLeave: Math.max(0, (globalSettings.sickLeave || 10) - used.sickLeave),
                    casualLeave: Math.max(0, (globalSettings.casualLeave || 12) - used.casualLeave),
                    earnedLeave: Math.max(0, (globalSettings.earnedLeave || 18) - used.earnedLeave),
                    unpaidLeave: Math.max(0, (globalSettings.unpaidLeave || 0) - used.unpaidLeave)
                };

                await employee.save();
            }
            console.log(`✅ Synced leave settings for ${employees.length} employees`);
        }

        res.json({ data: settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(400).json({ error: { message: error.message } });
    }
};
