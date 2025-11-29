const SSOConfig = require('../models/SSOConfig');
const { logAction } = require('./auditController');

const getSSOConfigs = async (req, res) => {
    try {
        const configs = await SSOConfig.find().select('-clientSecret -cert');
        res.json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch SSO configs' });
    }
};

const updateSSOConfig = async (req, res) => {
    try {
        const { provider, ...updates } = req.body;

        let config = await SSOConfig.findOne({ provider });

        if (!config) {
            config = new SSOConfig({ provider });
        }

        Object.assign(config, updates);
        config.updatedBy = req.user.id;

        await config.save();

        await logAction(req, 'UPDATE_SSO_CONFIG', provider, { updates: Object.keys(updates) });

        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update SSO config' });
    }
};

// Mock SSO Login Initiation
const initiateSSOLogin = async (req, res) => {
    const { provider } = req.params;
    // In a real app, this would redirect to the IdP
    res.json({
        success: true,
        message: `Redirecting to ${provider}...`,
        mockUrl: `https://${provider}.com/oauth/authorize?client_id=xyz`
    });
};

module.exports = {
    getSSOConfigs,
    updateSSOConfig,
    initiateSSOLogin
};
