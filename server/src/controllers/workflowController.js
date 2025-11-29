const Workflow = require('../models/Workflow');

// Create a new workflow
const createWorkflow = async (req, res) => {
    try {
        const { name, description, trigger, steps, isActive } = req.body;

        const workflow = await Workflow.create({
            name,
            description,
            trigger,
            steps,
            isActive,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: workflow
        });
    } catch (error) {
        console.error('Create workflow error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create workflow'
        });
    }
};

// Get all workflows
const getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: workflows
        });
    } catch (error) {
        console.error('Get workflows error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workflows'
        });
    }
};

// Update workflow
const updateWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const workflow = await Workflow.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            updates,
            { new: true }
        );

        if (!workflow) {
            return res.status(404).json({
                success: false,
                error: 'Workflow not found'
            });
        }

        res.json({
            success: true,
            data: workflow
        });
    } catch (error) {
        console.error('Update workflow error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update workflow'
        });
    }
};

// Delete workflow
const deleteWorkflow = async (req, res) => {
    try {
        const { id } = req.params;

        const workflow = await Workflow.findOneAndDelete({
            _id: id,
            createdBy: req.user.id
        });

        if (!workflow) {
            return res.status(404).json({
                success: false,
                error: 'Workflow not found'
            });
        }

        res.json({
            success: true,
            message: 'Workflow deleted'
        });
    } catch (error) {
        console.error('Delete workflow error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete workflow'
        });
    }
};

// Toggle workflow status
const toggleWorkflow = async (req, res) => {
    try {
        const { id } = req.params;

        const workflow = await Workflow.findOne({ _id: id, createdBy: req.user.id });

        if (!workflow) {
            return res.status(404).json({
                success: false,
                error: 'Workflow not found'
            });
        }

        workflow.isActive = !workflow.isActive;
        await workflow.save();

        res.json({
            success: true,
            data: workflow
        });
    } catch (error) {
        console.error('Toggle workflow error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle workflow'
        });
    }
};

module.exports = {
    createWorkflow,
    getWorkflows,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow
};
