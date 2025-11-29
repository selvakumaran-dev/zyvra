const express = require('express');
const router = express.Router();
const {
    createWorkflow,
    getWorkflows,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow
} = require('../controllers/workflowController');
const { getWorkflowLogs, executeWorkflow } = require('../controllers/workflowLogController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createWorkflow);
router.get('/', auth, getWorkflows);
router.put('/:id', auth, updateWorkflow);
router.delete('/:id', auth, deleteWorkflow);
router.put('/:id/toggle', auth, toggleWorkflow);

// Advanced features
router.get('/:id/logs', auth, getWorkflowLogs);
router.post('/:id/execute', auth, executeWorkflow);

module.exports = router;
