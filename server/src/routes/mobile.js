const express = require('express');
const router = express.Router();
const { getMobileDashboard, mobileCheckIn } = require('../controllers/mobileController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, getMobileDashboard);
router.post('/check-in', auth, mobileCheckIn);

module.exports = router;
