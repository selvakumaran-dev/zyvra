import React, { useState } from 'react';
import { BarChart3, FileText, Save } from 'lucide-react';
import ReportsDashboard from '../../components/Reports/ReportsDashboard';
import ReportBuilder from '../../components/Reports/ReportBuilder';
import SavedReports from '../../components/Reports/SavedReports';
import styles from './Reports.module.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [editingReport, setEditingReport] = useState(null);

    const handleEditReport = (report) => {
        setEditingReport(report);
        setActiveTab('create');
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'create', label: 'Create Report', icon: FileText },
        { id: 'saved', label: 'Saved Reports', icon: Save }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports & Analytics</h1>
                <p className={styles.subtitle}>Generate insights and export data</p>
            </div>

            <div className={styles.tabs}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className={styles.content}>
                {activeTab === 'dashboard' && <ReportsDashboard />}
                {activeTab === 'create' && (
                    <ReportBuilder
                        editingReport={editingReport}
                        onSaved={() => {
                            setEditingReport(null);
                            setActiveTab('saved');
                        }}
                    />
                )}
                {activeTab === 'saved' && (
                    <SavedReports
                        onEdit={handleEditReport}
                        onCreate={() => setActiveTab('create')}
                    />
                )}
            </div>
        </div>
    );
};

export default Reports;
