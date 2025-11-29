const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');

// --- POLICIES ---

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find();
        res.json({ data: policies });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createPolicy = async (req, res) => {
    try {
        const newPolicy = new Policy(req.body);
        const savedPolicy = await newPolicy.save();
        res.status(201).json({ data: savedPolicy });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

// --- AUDIT LOGS ---

exports.getAllAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('actor', 'firstName lastName');
        res.json({ data: logs });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.getMyAuditLogs = async (req, res) => {
    try {
        // req.user is set by auth middleware
        // We need the employee ID associated with the user
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);

        if (!user || !user.employee) {
            return res.json({ data: [] });
        }

        const logs = await AuditLog.find({ actor: user.employee })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ data: logs });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createAuditLog = async (req, res) => {
    try {
        const newLog = new AuditLog(req.body);
        await newLog.save();
        res.status(201).json({ message: 'Log recorded' });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

// --- GDPR / PRIVACY ---

exports.anonymizeEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const Employee = require('../models/Employee');

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ error: { message: 'Employee not found' } });

        // GDPR: Right to be Forgotten - Mask PII
        employee.firstName = 'Anonymized';
        employee.lastName = 'User';
        employee.email = `deleted_${id}@anonymized.com`;
        employee.phone = '000-000-0000';
        employee.address = 'Redacted';
        employee.photo = null;
        employee.status = 'Terminated';

        await employee.save();

        // Log this critical action
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            action: 'GDPR_ANONYMIZE',
            actor: req.user.id,
            target: `Employee:${id}`,
            ipAddress: req.ip,
            status: 'Success'
        });

        res.json({ message: 'Employee data anonymized successfully' });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
