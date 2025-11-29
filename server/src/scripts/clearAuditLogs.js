const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
require('dotenv').config();

const clearAuditLogs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // Delete all audit logs
        const result = await AuditLog.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} audit log entries`);

        console.log('🎉 Audit logs cleared successfully!');
        console.log('💡 New audit logs will be created automatically as users perform actions');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing audit logs:', error);
        process.exit(1);
    }
};

clearAuditLogs();
