import React, { useState, useEffect } from 'react';
import { Play, Edit, Trash2, Download, Calendar, FileText } from 'lucide-react';
import api from '../../services/api';
import Button from '../UI/Button';
import Card from '../UI/Card';
import styles from './SavedReports.module.css';

const SavedReports = ({ onEdit, onCreate }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/reports');
            setReports(response.data.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            await api.delete(`/reports/${id}`);
            setReports(reports.filter(r => r._id !== id));
        } catch (error) {
            console.error('Failed to delete report:', error);
            alert('Failed to delete report');
        }
    };

    const handleRun = async (report) => {
        try {
            const response = await api.get(`/reports/${report._id}/execute`);
            // TODO: Show results in a modal or new page
            console.log('Report results:', response.data);
            alert(`Report executed successfully! Found ${response.data.data.count} records.`);
        } catch (error) {
            console.error('Failed to execute report:', error);
            alert('Failed to execute report');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading saved reports...</div>;
    }

    if (reports.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No saved reports yet.</p>
                <p className={styles.emptySubtext}>Create a report to save it for later use.</p>
                <Button
                    onClick={onCreate}
                    className={styles.createButton}
                    style={{ marginTop: '16px' }}
                >
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    Create New Report
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {reports.map(report => (
                    <Card key={report._id} className={styles.reportCard}>
                        <div className={styles.reportHeader}>
                            <h3 className={styles.reportName}>{report.name}</h3>
                            <span className={styles.reportType}>{report.dataSource}</span>
                        </div>

                        {report.description && (
                            <p className={styles.reportDescription}>{report.description}</p>
                        )}

                        <div className={styles.reportMeta}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            {report.lastRunAt && (
                                <div className={styles.metaItem}>
                                    <span className={styles.lastRun}>
                                        Last run: {new Date(report.lastRunAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={styles.reportActions}>
                            <Button
                                size="small"
                                onClick={() => handleRun(report)}
                                className={styles.actionButton}
                            >
                                <Play size={14} />
                                Run
                            </Button>
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => onEdit(report)}
                                className={styles.actionButton}
                            >
                                <Edit size={14} />
                                Edit
                            </Button>
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => handleDelete(report._id)}
                                className={styles.actionButton}
                            >
                                <Trash2 size={14} />
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SavedReports;
