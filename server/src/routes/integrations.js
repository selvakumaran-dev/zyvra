const express = require('express');
const router = express.Router();
const {
    getIntegrations,
    updateIntegration,
    getWebhooks,
    createWebhook,
    deleteWebhook,
    testWebhook
} = require('../controllers/integrationController');
const { auth } = require('../middleware/auth');

// Integrations
router.get('/', auth, getIntegrations);
router.put('/', auth, updateIntegration);

// Webhooks
router.get('/webhooks', auth, getWebhooks);
router.post('/webhooks', auth, createWebhook);
router.delete('/webhooks/:id', auth, deleteWebhook);
router.post('/webhooks/:id/test', auth, testWebhook);

module.exports = router;
