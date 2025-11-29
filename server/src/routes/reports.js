const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    executeReport,
    previewReport,
    updateReport,
    deleteReport
} = require('../controllers/reportController');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// Analytics - must come before :id routes
router.get('/analytics/dashboard', auth, getDashboardAnalytics);

router.post('/', auth, createReport);
router.get('/', auth, getReports);
router.get('/:id/execute', auth, executeReport);
router.post('/preview', auth, previewReport);
router.put('/:id', auth, updateReport);
router.delete('/:id', auth, deleteReport);

module.exports = router;
