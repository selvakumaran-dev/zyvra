const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

const { auth } = require('../middleware/auth');

router.post('/', auth, leaveController.applyLeave);
router.get('/', auth, leaveController.getAllLeaves);
router.patch('/:id', auth, leaveController.updateLeave);
router.patch('/:id/status', auth, leaveController.updateLeaveStatus);

module.exports = router;
