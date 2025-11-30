const Employee = require('../models/Employee');
const User = require('../models/User');

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json({ data: employees });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

// Create new employee
exports.createEmployee = async (req, res) => {
    try {
        let email = req.body.email;

        // Check if email already exists for an ACTIVE employee
        const existingEmployee = await Employee.findOne({
            email: email,
            status: { $ne: 'Terminated' } // Not terminated
        });

        // If email exists for active employee, append random number
        if (existingEmployee) {
            const emailParts = email.split('@');
            const localPart = emailParts[0];
            const domain = emailParts[1];

            // Keep trying until we find a unique email
            let uniqueEmail = email;
            let attempts = 0;
            const maxAttempts = 100;

            while (attempts < maxAttempts) {
                const randomNum = Math.floor(Math.random() * 10000);
                uniqueEmail = `${localPart}${randomNum}@${domain}`;

                const duplicate = await Employee.findOne({
                    email: uniqueEmail,
                    status: { $ne: 'Terminated' }
                });

                if (!duplicate) {
                    email = uniqueEmail;
                    break;
                }
                attempts++;
            }

            if (attempts >= maxAttempts) {
                return res.status(400).json({
                    error: {
                        message: 'Unable to generate unique email. Please try a different email address.'
                    }
                });
            }
        }

        // Fetch global leave settings
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        const defaultLeaveBalance = settings?.leaveSettings ? settings.leaveSettings.toObject() : {
            casualLeave: 12,
            sickLeave: 10,
            earnedLeave: 18,
            unpaidLeave: 0
        };

        // Create employee with the unique email and global leave settings
        const newEmployee = new Employee({
            ...req.body,
            email: email,
            leaveBalance: defaultLeaveBalance
        });

        const savedEmployee = await newEmployee.save();

        // Return response with info about email modification
        const response = {
            data: savedEmployee
        };

        if (email !== req.body.email) {
            response.message = `Email was modified to ${email} to ensure uniqueness`;
        }

        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: { message: 'Employee not found' } });
        res.json({ data: employee });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) return res.status(404).json({ error: { message: 'Employee not found' } });
        res.json({ data: updatedEmployee });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

// Delete employee (Soft delete & Deactivate User)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: { message: 'Employee not found' } });

        // Soft delete / Deactivate Employee
        employee.status = 'Terminated';
        await employee.save();

        // Deactivate User account to prevent login
        const userUpdate = await User.findOneAndUpdate(
            { employee: employee._id },
            { isActive: false },
            { new: true }
        );

        if (userUpdate) {
            console.log(`✅ User account deactivated for employee: ${employee.firstName} ${employee.lastName}`);
        } else {
            console.log(`ℹ️  No user account found for employee: ${employee.firstName} ${employee.lastName}`);
        }

        res.json({
            message: 'Employee removed and access revoked successfully',
            data: {
                employeeId: employee._id,
                userDeactivated: !!userUpdate
            }
        });
    } catch (error) {
        console.error('❌ Error deleting employee:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: { message: 'No file uploaded' } });
        }

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: { message: 'Employee not found' } });
        }

        // Delete old avatar file if exists
        if (employee.avatar) {
            const fs = require('fs');
            const path = require('path');
            const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(employee.avatar));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Update employee with new avatar path
        employee.avatar = `/uploads/avatars/${req.file.filename}`;
        await employee.save();

        res.json({
            message: 'Avatar uploaded successfully',
            data: employee
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

// Bulk create employees
exports.bulkCreateEmployees = async (req, res) => {
    try {
        const employees = req.body;
        if (!Array.isArray(employees)) {
            return res.status(400).json({ error: { message: 'Input must be an array of employees' } });
        }

        const results = {
            success: [],
            errors: []
        };

        // Fetch global leave settings once
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        const defaultLeaveBalance = settings?.leaveSettings ? settings.leaveSettings.toObject() : {
            casualLeave: 12,
            sickLeave: 10,
            earnedLeave: 18,
            unpaidLeave: 0
        };

        for (let i = 0; i < employees.length; i++) {
            const employeeData = employees[i];
            try {
                // Auto-generate email from firstName if not provided
                let email = employeeData.email || `${employeeData.firstName.toLowerCase()}@zyvra.com`;

                // Check if email already exists for an ACTIVE employee
                const existingEmployee = await Employee.findOne({
                    email: email,
                    status: { $ne: 'Terminated' }
                });

                // If email exists, append random number
                if (existingEmployee) {
                    const emailParts = email.split('@');
                    const localPart = emailParts[0];
                    const domain = emailParts[1];

                    let uniqueEmail = email;
                    let attempts = 0;
                    const maxAttempts = 100;

                    while (attempts < maxAttempts) {
                        const randomNum = Math.floor(Math.random() * 10000);
                        uniqueEmail = `${localPart}${randomNum}@${domain}`;

                        const duplicate = await Employee.findOne({
                            email: uniqueEmail,
                            status: { $ne: 'Terminated' }
                        });

                        if (!duplicate) {
                            email = uniqueEmail;
                            break;
                        }
                        attempts++;
                    }

                    if (attempts >= maxAttempts) {
                        throw new Error(`Unable to generate unique email for ${email}`);
                    }
                }

                const newEmployee = new Employee({
                    ...employeeData,
                    email: email,
                    leaveBalance: defaultLeaveBalance
                });

                const savedEmployee = await newEmployee.save();
                results.success.push(savedEmployee);
            } catch (error) {
                results.errors.push({
                    employee: employeeData,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            message: `Processed ${employees.length} employees`,
            data: results
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
