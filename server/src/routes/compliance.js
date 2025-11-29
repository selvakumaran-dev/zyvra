const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { auth } = require('../middleware/auth');

// Policies
router.get('/policies', auth, complianceController.getAllPolicies);
router.post('/policies', auth, complianceController.createPolicy);
router.get('/audit-logs', auth, complianceController.getAllAuditLogs);
router.get('/audit-logs/me', auth, complianceController.getMyAuditLogs);
router.post('/audit-logs', auth, complianceController.createAuditLog);
router.post('/gdpr/anonymize/:id', auth, complianceController.anonymizeEmployee);

module.exports = router;
