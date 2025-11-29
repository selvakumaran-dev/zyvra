import React, { useState, useEffect } from 'react';
import {
    Slack,
    Calendar,
    Video,
    Zap,
    CheckCircle,
    XCircle,
    Settings,
    Plus,
    Trash2,
    Send
} from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './Integrations.module.css';

const Integrations = () => {
    const [integrations, setIntegrations] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps');

    // Webhook form state
    const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [intRes, webRes] = await Promise.all([
                api.get('/integrations'),
                api.get('/integrations/webhooks')
            ]);
            setIntegrations(intRes.data.data);
            setWebhooks(webRes.data.data);
        } catch (error) {
            console.error('Failed to fetch integrations', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleIntegration = async (type, currentState) => {
        try {
            const newState = !currentState;
            await api.put('/integrations', {
                type,
                isEnabled: newState
            });

            showToast.success(`${type} ${newState ? 'connected' : 'disconnected'}`);
            fetchData();
        } catch (error) {
            showToast.error('Failed to update integration');
        }
    };

    const handleCreateWebhook = async () => {
        try {
            await api.post('/integrations/webhooks', {
                ...newWebhook,
                events: ['employee.created'] // Default for demo
            });
            showToast.success('Webhook created');
            setNewWebhook({ name: '', url: '', events: [] });
            fetchData();
        } catch (error) {
            showToast.error('Failed to create webhook');
        }
    };

    const handleDeleteWebhook = async (id) => {
        try {
            await api.delete(`/integrations/webhooks/${id}`);
            showToast.success('Webhook deleted');
            fetchData();
        } catch (error) {
            showToast.error('Failed to delete webhook');
        }
    };

    const handleTestWebhook = async (id) => {
        try {
            await api.post(`/integrations/webhooks/${id}/test`);
            showToast.success('Test payload sent!');
        } catch (error) {
            showToast.error('Test failed');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'slack': return <Slack size={32} color="#4A154B" />;
            case 'google_calendar': return <Calendar size={32} color="#4285F4" />;
            case 'zoom': return <Video size={32} color="#2D8CFF" />;
            default: return <Zap size={32} />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Integrations</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'apps' ? styles.active : ''}`}
                        onClick={() => setActiveTab('apps')}
                    >
                        Connected Apps
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'webhooks' ? styles.active : ''}`}
                        onClick={() => setActiveTab('webhooks')}
                    >
                        Webhooks
                    </button>
                </div>
            </div>

            {activeTab === 'apps' ? (
                <div className={styles.grid}>
                    {integrations.map(app => (
                        <div key={app.type} className={styles.card}>
                            <div className={styles.cardHeader}>
                                {getIcon(app.type)}
                                <div className={styles.statusBadge}>
                                    {app.isEnabled ? (
                                        <span className={styles.connected}><CheckCircle size={12} /> Connected</span>
                                    ) : (
                                        <span className={styles.disconnected}><XCircle size={12} /> Disconnected</span>
                                    )}
                                </div>
                            </div>
                            <h3>{app.name}</h3>
                            <p className={styles.description}>
                                {app.type === 'slack' && 'Send notifications to Slack channels.'}
                                {app.type === 'google_calendar' && 'Sync leave requests with Calendar.'}
                                {app.type === 'zoom' && 'Auto-generate interview links.'}
                            </p>
                            <button
                                className={`${styles.connectButton} ${app.isEnabled ? styles.disconnect : ''}`}
                                onClick={() => toggleIntegration(app.type, app.isEnabled)}
                            >
                                {app.isEnabled ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.webhooksContainer}>
                    <div className={styles.createWebhook}>
                        <h3>Add New Webhook</h3>
                        <div className={styles.formRow}>
                            <input
                                type="text"
                                placeholder="Name (e.g. Zapier Employee Sync)"
                                value={newWebhook.name}
                                onChange={e => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Payload URL"
                                value={newWebhook.url}
                                onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                className={styles.input}
                            />
                            <button className={styles.addButton} onClick={handleCreateWebhook}>
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </div>

                    <div className={styles.webhookList}>
                        {webhooks.map(hook => (
                            <div key={hook._id} className={styles.webhookItem}>
                                <div className={styles.webhookInfo}>
                                    <h4>{hook.name}</h4>
                                    <code className={styles.url}>{hook.url}</code>
                                    <div className={styles.stats}>
                                        <span>Deliveries: {hook.stats.deliveries}</span>
                                    </div>
                                </div>
                                <div className={styles.webhookActions}>
                                    <button
                                        className={styles.iconButton}
                                        title="Test"
                                        onClick={() => handleTestWebhook(hook._id)}
                                    >
                                        <Send size={16} />
                                    </button>
                                    <button
                                        className={`${styles.iconButton} ${styles.danger}`}
                                        onClick={() => handleDeleteWebhook(hook._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;
