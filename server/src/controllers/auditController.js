const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, target, metadata = {}, status = 'Success') => {
    try {
        // Handle cases where req.user might not be populated (e.g. login failure)
        const actor = req.user ? req.user.id : null;

        await AuditLog.create({
            action,
            actor,
            target,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            status,
            metadata
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, actor } = req.query;
        const query = {};

        if (action) query.action = action;
        if (actor) query.actor = actor;

        const logs = await AuditLog.find(query)
            .populate('actor', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page: Number(page)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
};

module.exports = {
    logAction,
    getAuditLogs
};
