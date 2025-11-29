const express = require('express');
const router = express.Router();
const {
    getDashboardAnalytics,
    getOverviewAnalytics,
    getPerformanceAnalytics,
    getAttritionAnalytics
} = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, getDashboardAnalytics);
router.get('/overview', auth, getOverviewAnalytics);
router.get('/performance', auth, getPerformanceAnalytics);
router.get('/attrition', auth, getAttritionAnalytics);

module.exports = router;
