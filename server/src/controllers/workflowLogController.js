const Workflow = require('../models/Workflow');
const WorkflowLog = require('../models/WorkflowLog');

// Get logs for a specific workflow
const getWorkflowLogs = async (req, res) => {
    try {
        const logs = await WorkflowLog.find({ workflow: req.params.id })
            .sort({ startedAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Get workflow logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workflow logs'
        });
    }
};

// Mock execution for demonstration
const executeWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }

        // Create a mock log entry
        const log = new WorkflowLog({
            workflow: workflow._id,
            triggerEvent: workflow.trigger.config.event || 'manual_trigger',
            status: 'running',
            steps: []
        });

        // Simulate steps execution
        for (const step of workflow.steps) {
            log.steps.push({
                stepId: step.id,
                status: 'success',
                output: { message: `Executed ${step.type}` },
                executedAt: new Date()
            });
        }

        log.status = 'success';
        log.completedAt = new Date();
        await log.save();

        // Update workflow stats
        workflow.stats.runs += 1;
        workflow.stats.success += 1;
        workflow.stats.lastRunAt = new Date();
        await workflow.save();

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('Execute workflow error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute workflow'
        });
    }
};

module.exports = {
    getWorkflowLogs,
    executeWorkflow
};
