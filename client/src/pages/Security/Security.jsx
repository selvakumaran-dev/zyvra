import React, { useState, useEffect } from 'react';
import {
    Shield,
    Key,
    Activity,
    Search,
    Lock,
    Globe,
    Save
} from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './Security.module.css';

const Security = () => {
    const [activeTab, setActiveTab] = useState('audit');
    const [logs, setLogs] = useState([]);
    const [ssoConfigs, setSsoConfigs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'audit') fetchLogs();
        else fetchSSO();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/security/audit-logs');
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSSO = async () => {
        setLoading(true);
        try {
            const response = await api.get('/security/sso');
            setSsoConfigs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch SSO', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSSOUpdate = async (provider, data) => {
        try {
            await api.put('/security/sso', { provider, ...data });
            showToast.success('SSO settings updated');
            fetchSSO();
        } catch (error) {
            showToast.error('Failed to update SSO');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Enterprise Security</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'audit' ? styles.active : ''}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        <Activity size={16} /> Audit Logs
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sso' ? styles.active : ''}`}
                        onClick={() => setActiveTab('sso')}
                    >
                        <Key size={16} /> SSO Settings
                    </button>
                </div>
            </div>

            {activeTab === 'audit' ? (
                <div className={styles.card}>
                    <div className={styles.tableHeader}>
                        <h3>Recent Activity</h3>
                        <div className={styles.searchBox}>
                            <Search size={16} />
                            <input type="text" placeholder="Search logs..." />
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>User</th>
                                <th>Target</th>
                                <th>IP Address</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td className={styles.actionCell}>{log.action}</td>
                                    <td>
                                        {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                                    </td>
                                    <td>{log.target || '-'}</td>
                                    <td>{log.ipAddress}</td>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.status} ${log.status === 'Success' ? styles.success : styles.failure}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className={styles.empty}>No logs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.grid}>
                    {['google', 'okta'].map(provider => {
                        const config = ssoConfigs.find(c => c.provider === provider) || { isEnabled: false };
                        return (
                            <div key={provider} className={styles.ssoCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.providerInfo}>
                                        {provider === 'google' ? <Globe size={24} /> : <Lock size={24} />}
                                        <h3>{provider === 'google' ? 'Google Workspace' : 'Okta SAML'}</h3>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={config.isEnabled}
                                            onChange={(e) => handleSSOUpdate(provider, { isEnabled: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Client ID / Issuer</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        defaultValue={config.clientId || config.issuer}
                                        placeholder={provider === 'google' ? "OAuth Client ID" : "SAML Issuer URL"}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Client Secret / Cert</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        defaultValue="********"
                                        placeholder="Secret Key"
                                    />
                                </div>
                                <button className={styles.saveButton}>
                                    <Save size={16} /> Save Configuration
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Security;
