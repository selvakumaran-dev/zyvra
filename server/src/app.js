const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const connectDB = require('./config/database');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./config/logger');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: ['http://localhost:5176', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Length']
}));
app.use(rateLimiter);

// Performance Middleware
app.use(compression());

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/employees', require('./routes/employees'));
app.use('/api/v1/recruitment', require('./routes/recruitment'));
app.use('/api/v1/payroll', require('./routes/payroll'));
app.use('/api/v1/performance', require('./routes/performance'));
app.use('/api/v1/compliance', require('./routes/compliance'));
app.use('/api/v1/attendance', require('./routes/attendance'));
app.use('/api/v1/leaves', require('./routes/leave'));
app.use('/api/v1/documents', require('./routes/documents'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/search', require('./routes/search'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/workflows', require('./routes/workflows'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/integrations', require('./routes/integrations'));
app.use('/api/v1/security', require('./routes/security'));
app.use('/api/v1/mobile', require('./routes/mobile'));
app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/settings', require('./routes/settings'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(err.status || 500).json({
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'The requested resource was not found'
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`🚀 Zyvra Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📑 Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
