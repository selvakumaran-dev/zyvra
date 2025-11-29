const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Authentication required' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('employee');

        if (!user || !user.isActive) {
            return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid authentication' } });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Authentication failed' } });
    }
};

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }

        next();
    };
};

module.exports = { auth, authorize };
