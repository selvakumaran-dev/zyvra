const mongoose = require('mongoose');

const ssoConfigSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['google', 'okta', 'azure'],
        required: true,
        unique: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    clientId: String,
    clientSecret: String,
    entryPoint: String, // For SAML
    issuer: String,     // For SAML
    cert: String,       // For SAML
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SSOConfig', ssoConfigSchema);
