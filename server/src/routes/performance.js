const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Goals
router.get('/goals', performanceController.getAllGoals);
router.post('/goals', performanceController.createGoal);

// Reviews
router.get('/reviews', performanceController.getAllReviews);
router.post('/reviews', performanceController.createReview);

// Employee-specific goals
router.get('/goals/employee/:employeeId', performanceController.getEmployeeGoals);
router.patch('/goals/:id/progress', performanceController.updateGoalProgress);

module.exports = router;
