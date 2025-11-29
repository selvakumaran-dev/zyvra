const express = require('express');
const router = express.Router();
const { globalSearch, getQuickActions } = require('../controllers/searchController');
const { auth } = require('../middleware/auth');

// Add timestamp middleware for performance tracking
router.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Search endpoint
router.get('/', auth, globalSearch);

// Quick actions endpoint
router.get('/actions', auth, getQuickActions);

module.exports = router;
