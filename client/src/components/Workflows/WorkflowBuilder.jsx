import React, { useState, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Save,
    Play,
    Plus,
    Settings,
    Trash2,
    Zap,
    Mail,
    Database,
    Clock,
    GitBranch
} from 'lucide-react';
import styles from './WorkflowBuilder.module.css';
import { showToast } from '../../utils/toast';

const initialNodes = [
    {
        id: 'trigger-1',
        type: 'input',
        data: { label: 'New Employee Created' },
        position: { x: 250, y: 50 },
        style: { background: '#fff', border: '1px solid #777', borderRadius: '8px', padding: '10px', width: 180 }
    },
    {
        id: 'action-1',
        data: { label: 'Send Welcome Email' },
        position: { x: 250, y: 150 },
        style: { background: '#fff', border: '1px solid #777', borderRadius: '8px', padding: '10px', width: 180 }
    },
    {
        id: 'action-2',
        data: { label: 'Create Slack Account' },
        position: { x: 250, y: 250 },
        style: { background: '#fff', border: '1px solid #777', borderRadius: '8px', padding: '10px', width: 180 }
    }
];

const initialEdges = [
    { id: 'e1-2', source: 'trigger-1', target: 'action-1', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: 'action-1', target: 'action-2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } }
];

import ConditionNode from './nodes/ConditionNode';
import api from '../../services/api';

const nodeTypes = {
    condition: ConditionNode,
};

const WorkflowBuilder = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [workflowName, setWorkflowName] = useState('Onboarding Workflow');
    const [activeTab, setActiveTab] = useState('builder');
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onSave = async () => {
        // In a real app, save nodes and edges to backend
        // For now, we'll just simulate saving
        showToast.success('Workflow saved successfully');
    };

    const onActivate = async () => {
        try {
            showToast.loading('Executing workflow...');
            // Use a dummy ID for now as we haven't saved the workflow to DB yet in this demo
            // In a real scenario, we'd save first, then execute
            // For demo purposes, we'll just show success
            setTimeout(() => {
                showToast.success('Workflow executed successfully');
                fetchLogs(); // Refresh logs (mock)
            }, 1000);
        } catch (error) {
            showToast.error('Failed to execute workflow');
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            // Mock logs for demonstration since we don't have a real workflow ID in the URL yet
            const mockLogs = [
                {
                    _id: 'log-1',
                    status: 'success',
                    triggerEvent: 'employee.created',
                    startedAt: new Date().toISOString(),
                    steps: [
                        { stepId: 'trigger-1', status: 'success', output: { event: 'New Employee' } },
                        { stepId: 'action-1', status: 'success', output: { email: 'sent' } },
                        { stepId: 'action-2', status: 'success', output: { slack: 'created' } }
                    ]
                },
                {
                    _id: 'log-2',
                    status: 'failed',
                    triggerEvent: 'manual_trigger',
                    startedAt: new Date(Date.now() - 86400000).toISOString(),
                    error: 'SMTP Connection Timeout',
                    steps: [
                        { stepId: 'trigger-1', status: 'success', output: { event: 'Manual' } },
                        { stepId: 'action-1', status: 'failed', output: { error: 'Timeout' } }
                    ]
                }
            ];
            setLogs(mockLogs);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const addNode = (type) => {
        const id = `node-${nodes.length + 1}`;
        const isCondition = type === 'Condition';
        const newNode = {
            id,
            type: isCondition ? 'condition' : 'default',
            data: { label: isCondition ? 'Check Department' : `New ${type}` },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            style: isCondition ? undefined : { background: '#fff', border: '1px solid #777', borderRadius: '8px', padding: '10px', width: 180 }
        };
        setNodes((nds) => [...nds, newNode]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        className={styles.titleInput}
                    />
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'builder' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('builder')}
                        >
                            Builder
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                            onClick={() => { setActiveTab('history'); fetchLogs(); }}
                        >
                            History
                        </button>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.button} onClick={onSave}>
                        <Save size={16} />
                        Save
                    </button>
                    <button className={`${styles.button} ${styles.primary}`} onClick={onActivate}>
                        <Play size={16} />
                        Test Run
                    </button>
                </div>
            </div>

            {activeTab === 'builder' ? (
                <div className={styles.builder}>
                    <div className={styles.sidebar}>
                        <h3>Components</h3>
                        <div className={styles.componentList}>
                            <div className={styles.componentItem} onClick={() => addNode('Trigger')}>
                                <Zap size={16} />
                                <span>Trigger</span>
                            </div>
                            <div className={styles.componentItem} onClick={() => addNode('Condition')}>
                                <GitBranch size={16} />
                                <span>Condition</span>
                            </div>
                            <div className={styles.componentItem} onClick={() => addNode('Email')}>
                                <Mail size={16} />
                                <span>Send Email</span>
                            </div>
                            <div className={styles.componentItem} onClick={() => addNode('Update')}>
                                <Database size={16} />
                                <span>Update Record</span>
                            </div>
                            <div className={styles.componentItem} onClick={() => addNode('Delay')}>
                                <Clock size={16} />
                                <span>Delay</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.canvas}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            fitView
                        >
                            <Background />
                            <Controls />
                            <MiniMap />
                        </ReactFlow>
                    </div>
                </div>
            ) : (
                <div className={styles.history}>
                    <table className={styles.logsTable}>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Trigger</th>
                                <th>Started At</th>
                                <th>Steps Executed</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td>
                                        <span className={`${styles.status} ${styles[log.status]}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>{log.triggerEvent}</td>
                                    <td>{new Date(log.startedAt).toLocaleString()}</td>
                                    <td>{log.steps.length}</td>
                                    <td>
                                        {log.error ? (
                                            <span className={styles.errorText}>{log.error}</span>
                                        ) : (
                                            <span className={styles.successText}>Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WorkflowBuilder;
