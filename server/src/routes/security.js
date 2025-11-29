const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { getSSOConfigs, updateSSOConfig, initiateSSOLogin } = require('../controllers/ssoController');
const { auth } = require('../middleware/auth');

// Audit Logs
router.get('/audit-logs', auth, getAuditLogs);

// SSO
router.get('/sso', auth, getSSOConfigs);
router.put('/sso', auth, updateSSOConfig);
router.get('/sso/:provider/login', initiateSSOLogin); // Public route for login

module.exports = router;
