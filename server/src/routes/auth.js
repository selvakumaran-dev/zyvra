const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trim inputs to prevent whitespace issues
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();

        // Find user
        const user = await User.findOne({ email: trimmedEmail })
            .populate('employee')
            .populate('applicant');
        if (!user) {
            console.log('❌ Login failed: User not found for email:', trimmedEmail);
            return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }

        // Check password
        const isMatch = await user.comparePassword(trimmedPassword);
        if (!isMatch) {
            console.log('❌ Login failed: Password mismatch for user:', trimmedEmail);
            // Log failed attempt if it was a valid user (optional, but good for security)
            // We can't log it easily if we don't have an employee ID and the schema requires it.
            // Skipping failed attempt logging for now to avoid schema validation errors if user is not an employee.
            return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }

        // Check if active
        if (!user.isActive) {
            console.log('❌ Login failed: Account disabled for user:', trimmedEmail);
            return res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account is disabled' } });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create Audit Log for Login Success
        if (user.employee) {
            try {
                await AuditLog.create({
                    action: 'LOGIN_SUCCESS',
                    actor: user.employee._id,
                    target: 'System',
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    status: 'Success',
                    metadata: { email: user.email, role: user.role }
                });
            } catch (logError) {
                console.error('Failed to create audit log:', logError);
                // Don't block login if logging fails
            }
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    employee: user.employee
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: { code: 'LOGIN_FAILED', message: error.message } });
    }
});

// Register (HR only - create employee account)
router.post('/register', auth, authorize('HR'), async (req, res) => {
    try {
        const { email, password, employeeId } = req.body;

        // Trim inputs to prevent whitespace issues
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();

        console.log('📝 Registration attempt:', {
            email: trimmedEmail,
            passwordLength: trimmedPassword?.length,
            employeeId
        });

        // Verify employee exists first
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            console.log('❌ Employee not found:', employeeId);
            return res.status(404).json({ error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found' } });
        }

        // Check if employee is terminated
        if (employee.status === 'Terminated') {
            console.log('❌ Cannot create account for terminated employee:', employeeId);
            return res.status(400).json({
                error: {
                    code: 'EMPLOYEE_TERMINATED',
                    message: 'Cannot create account for a terminated employee'
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            // Check if the existing user is for a terminated employee
            if (existingUser.employee) {
                const existingEmployee = await Employee.findById(existingUser.employee);
                if (existingEmployee && existingEmployee.status === 'Terminated') {
                    // Delete the old user account for terminated employee
                    await User.findByIdAndDelete(existingUser._id);
                    console.log('🗑️  Deleted old user account for terminated employee');
                } else {
                    // User exists for an active employee
                    console.log('❌ User already exists for active employee:', trimmedEmail);
                    return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists' } });
                }
            } else {
                console.log('❌ User already exists:', trimmedEmail);
                return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists' } });
            }
        }

        // Create user (isActive defaults to true for active employees)
        const user = await User.create({
            email: trimmedEmail,
            password: trimmedPassword,
            role: 'Employee',
            employee: employeeId,
            isActive: employee.status !== 'Terminated' // Set based on employee status
        });

        console.log('✅ User created successfully:', {
            id: user._id,
            email: user.email,
            role: user.role
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    employee: user.employee
                }
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: { code: 'REGISTRATION_FAILED', message: error.message } });
    }
});

// Public Applicant Registration
router.post('/register/applicant', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Trim inputs
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();
        const trimmedFirstName = firstName?.trim();
        const trimmedLastName = lastName?.trim();

        console.log('📝 Applicant registration attempt:', {
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName
        });

        // Validate required fields
        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'First name, last name, email, and password are required'
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            console.log('❌ User already exists:', trimmedEmail);
            return res.status(400).json({
                error: {
                    code: 'USER_EXISTS',
                    message: 'An account with this email already exists'
                }
            });
        }

        // Create applicant profile
        const Applicant = require('../models/Applicant');
        const applicant = await Applicant.create({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            phone: phone?.trim() || ''
        });

        // Create user account
        const user = await User.create({
            email: trimmedEmail,
            password: trimmedPassword,
            role: 'Applicant',
            applicant: applicant._id
        });

        console.log('✅ Applicant created successfully:', {
            userId: user._id,
            applicantId: applicant._id,
            email: user.email
        });

        // Generate token for immediate login
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    applicant: {
                        id: applicant._id,
                        firstName: applicant.firstName,
                        lastName: applicant.lastName,
                        fullName: applicant.fullName
                    }
                }
            }
        });
    } catch (error) {
        console.error('❌ Applicant registration error:', error);
        res.status(500).json({
            error: {
                code: 'REGISTRATION_FAILED',
                message: error.message
            }
        });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        res.status(500).json({ error: { code: 'FETCH_FAILED', message: error.message } });
    }
});

// Get all users (HR only)
router.get('/users', auth, authorize('HR'), async (req, res) => {
    try {
        const users = await User.find({}, 'email role employee isActive lastLogin')
            .populate('employee', 'firstName lastName designation department');

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ error: { code: 'FETCH_FAILED', message: error.message } });
    }
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Trim inputs
        const trimmedOldPassword = oldPassword?.trim();
        const trimmedNewPassword = newPassword?.trim();

        // Validate inputs
        if (!trimmedOldPassword || !trimmedNewPassword) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'Both old and new passwords are required'
                }
            });
        }

        // Validate new password length
        if (trimmedNewPassword.length < 6) {
            return res.status(400).json({
                error: {
                    code: 'WEAK_PASSWORD',
                    message: 'New password must be at least 6 characters long'
                }
            });
        }

        // Get user with password field
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Verify old password
        const isMatch = await user.comparePassword(trimmedOldPassword);
        if (!isMatch) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Current password is incorrect'
                }
            });
        }

        // Update password
        user.password = trimmedNewPassword;
        await user.save();

        // Log the password change
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            action: 'CHANGE_PASSWORD',
            actor: user._id,
            target: `User:${user._id}`,
            ipAddress: req.ip,
            status: 'Success'
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({
            error: {
                code: 'PASSWORD_CHANGE_FAILED',
                message: error.message
            }
        });
    }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', auth, async (req, res) => {
    try {
        // In a production app, you might want to blacklist the token
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: { code: 'LOGOUT_FAILED', message: error.message } });
    }
});

module.exports = router;
