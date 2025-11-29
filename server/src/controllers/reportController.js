const Report = require('../models/Report');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Candidate = require('../models/Candidate');
const Review = require('../models/Review');

// Helper to get model by data source
const getModelBySource = (source) => {
    switch (source) {
        case 'employees': return Employee;
        case 'payroll': return Payroll;
        case 'recruitment': return Candidate;
        case 'performance': return Review;
        default: return null;
    }
};

// Create a new report
const createReport = async (req, res) => {
    try {
        const { name, description, type, dataSource, config, isPublic } = req.body;

        const report = await Report.create({
            name,
            description,
            type,
            dataSource,
            config,
            isPublic,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create report'
        });
    }
};

// Get all reports
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({
            $or: [
                { createdBy: req.user.id },
                { isPublic: true }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports'
        });
    }
};

// Execute a report (fetch data)
const executeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        const Model = getModelBySource(report.dataSource);
        if (!Model) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data source'
            });
        }

        // Build query based on config
        let query = {};
        if (report.config.filters && report.config.filters.length > 0) {
            report.config.filters.forEach(filter => {
                if (filter.value) {
                    switch (filter.operator) {
                        case 'equals':
                            query[filter.field] = filter.value;
                            break;
                        case 'contains':
                            query[filter.field] = { $regex: filter.value, $options: 'i' };
                            break;
                        case 'gt':
                            query[filter.field] = { $gt: filter.value };
                            break;
                        case 'lt':
                            query[filter.field] = { $lt: filter.value };
                            break;
                    }
                }
            });
        }

        // Execute query
        let data = await Model.find(query)
            .select(report.config.fields.join(' '))
            .sort(report.config.sortBy ? { [report.config.sortBy.field]: report.config.sortBy.order } : {})
            .limit(1000) // Safety limit
            .lean();

        // Update last run
        report.lastRunAt = new Date();
        await report.save();

        res.json({
            success: true,
            data: {
                report,
                results: data,
                count: data.length
            }
        });

    } catch (error) {
        console.error('Execute report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute report'
        });
    }
};

// Preview report (execute without saving)
const previewReport = async (req, res) => {
    try {
        const { dataSource, config } = req.body;

        const Model = getModelBySource(dataSource);
        if (!Model) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data source'
            });
        }

        // Build query
        let query = {};
        if (config.filters && config.filters.length > 0) {
            config.filters.forEach(filter => {
                if (filter.value) {
                    switch (filter.operator) {
                        case 'equals':
                            query[filter.field] = filter.value;
                            break;
                        case 'contains':
                            query[filter.field] = { $regex: filter.value, $options: 'i' };
                            break;
                        case 'gt':
                            query[filter.field] = { $gt: filter.value };
                            break;
                        case 'lt':
                            query[filter.field] = { $lt: filter.value };
                            break;
                    }
                }
            });
        }

        const data = await Model.find(query)
            .select(config.fields.join(' '))
            .limit(50) // Preview limit
            .lean();

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Preview report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to preview report'
        });
    }
};

// Update a report
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, config } = req.body;

        const report = await Report.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            { name, description, config },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found or unauthorized'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update report'
        });
    }
};

// Delete a report
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findOneAndDelete({
            _id: id,
            createdBy: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete report'
        });
    }
};

module.exports = {
    createReport,
    getReports,
    executeReport,
    previewReport,
    updateReport,
    deleteReport
};
