const Integration = require('../models/Integration');
const Webhook = require('../models/Webhook');

// --- Integrations ---

const getIntegrations = async (req, res) => {
    try {
        const savedIntegrations = await Integration.find().select('-config.clientSecret -config.accessToken');

        const supportedTypes = [
            { type: 'slack', name: 'Slack', status: 'disconnected', isEnabled: false },
            { type: 'google_calendar', name: 'Google Calendar', status: 'disconnected', isEnabled: false },
            { type: 'zoom', name: 'Zoom', status: 'disconnected', isEnabled: false }
        ];

        const mergedIntegrations = supportedTypes.map(defaultType => {
            const saved = savedIntegrations.find(i => i.type === defaultType.type);
            return saved ? saved : defaultType;
        });

        res.json({ success: true, data: mergedIntegrations });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch integrations' });
    }
};

const updateIntegration = async (req, res) => {
    try {
        const { type, config, isEnabled } = req.body;

        let integration = await Integration.findOne({ type });

        if (!integration) {
            integration = new Integration({
                type,
                name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
                connectedBy: req.user.id
            });
        }

        if (config) integration.config = { ...integration.config, ...config };
        if (typeof isEnabled === 'boolean') integration.isEnabled = isEnabled;

        // Simulate connection check
        if (isEnabled) {
            integration.status = 'connected';
            integration.lastSyncAt = new Date();
        } else {
            integration.status = 'disconnected';
        }

        await integration.save();
        res.json({ success: true, data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update integration' });
    }
};

// --- Webhooks ---

const getWebhooks = async (req, res) => {
    try {
        const webhooks = await Webhook.find();
        res.json({ success: true, data: webhooks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch webhooks' });
    }
};

const createWebhook = async (req, res) => {
    try {
        const webhook = new Webhook({
            ...req.body,
            createdBy: req.user.id
        });
        await webhook.save();
        res.status(201).json({ success: true, data: webhook });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create webhook' });
    }
};

const deleteWebhook = async (req, res) => {
    try {
        await Webhook.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Webhook deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete webhook' });
    }
};

// Mock Trigger for testing
const testWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        const webhook = await Webhook.findById(id);
        if (!webhook) return res.status(404).json({ error: 'Webhook not found' });

        // Simulate delivery
        webhook.stats.deliveries += 1;
        webhook.stats.lastDeliveryAt = new Date();
        await webhook.save();

        res.json({ success: true, message: `Test payload sent to ${webhook.url}` });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Test failed' });
    }
};

module.exports = {
    getIntegrations,
    updateIntegration,
    getWebhooks,
    createWebhook,
    deleteWebhook,
    testWebhook
};
