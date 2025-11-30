const express = require('express');
const router = express.Router();
const { resetDatabase } = require('../controllers/resetController');
const { auth, authorize } = require('../middleware/auth');

// Reset database - HR only
router.post('/database', auth, authorize('HR'), resetDatabase);

module.exports = router;
