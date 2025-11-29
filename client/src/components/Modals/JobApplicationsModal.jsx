import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, Award, FileText, Calendar, Download, Trash2 } from 'lucide-react';
import api from '../../services/api';
import styles from './JobApplicationsModal.module.css';

const JobApplicationsModal = ({ isOpen, onClose, job }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && job) {
            fetchApplications();
        }
    }, [isOpen, job]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/recruitment/jobs/${job._id}/applications`);
            setApplications(response.data.data);
        } catch (err) {
            setError('Failed to fetch applications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (applicantId) => {
        if (window.confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
            try {
                await api.delete(`/recruitment/applicants/${applicantId}`);
                setApplications(applications.filter(app => app.applicantId !== applicantId));
            } catch (err) {
                console.error('Failed to delete applicant:', err);
                alert('Failed to delete applicant. Please try again.');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getResumeUrl = (path) => {
        if (!path) return null;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    if (!isOpen || !job) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Applications</h2>
                        <p className={styles.subtitle}>
                            {job.title} • {applications.length} Applicants
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading applications...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : applications.length === 0 ? (
                        <div className={styles.empty}>No applications yet.</div>
                    ) : (
                        <div className={styles.list}>
                            {applications.map((app) => (
                                <div key={app.applicantId} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className={styles.name}>{app.name}</h3>
                                                <div className={styles.contact}>
                                                    <span className={styles.contactItem}>
                                                        <Mail size={14} /> {app.email}
                                                    </span>
                                                    <span className={styles.contactItem}>
                                                        <Phone size={14} /> {app.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.statusBadge}>
                                            {app.status}
                                        </div>
                                    </div>

                                    <div className={styles.details}>
                                        <div className={styles.detailRow}>
                                            <div className={styles.detailItem}>
                                                <Briefcase size={16} className={styles.icon} />
                                                <strong>Experience:</strong> {app.experience} years
                                            </div>
                                            <div className={styles.detailItem}>
                                                <Calendar size={16} className={styles.icon} />
                                                <strong>Applied:</strong> {formatDate(app.appliedAt)}
                                            </div>
                                        </div>

                                        <div className={styles.skills}>
                                            <Award size={16} className={styles.icon} />
                                            <div className={styles.skillTags}>
                                                {app.skills.map((skill, index) => (
                                                    <span key={index} className={styles.skillTag}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {app.coverLetter && (
                                            <div className={styles.coverLetter}>
                                                <div className={styles.label}>
                                                    <FileText size={16} className={styles.icon} />
                                                    Cover Letter
                                                </div>
                                                <p className={styles.coverLetterText}>{app.coverLetter}</p>
                                            </div>
                                        )}

                                        <div className={styles.actions}>
                                            {app.resume && (
                                                <a
                                                    href={getResumeUrl(app.resume)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.resumeButton}
                                                >
                                                    <Download size={16} />
                                                    Download Resume
                                                </a>
                                            )}
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDelete(app.applicantId)}
                                                title="Delete Applicant"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobApplicationsModal;
