import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, Award, FileText, Calendar, Download, Trash2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import styles from './ApplicantProfileModal.module.css';

const ApplicantProfileModal = ({ isOpen, onClose, applicantId, onDelete }) => {
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && applicantId) {
            fetchApplicantDetails();
        }
    }, [isOpen, applicantId]);

    const fetchApplicantDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/recruitment/applicants/${applicantId}`);
            setApplicant(response.data.data);
        } catch (err) {
            setError('Failed to fetch applicant details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getResumeUrl = (path) => {
        if (!path) return null;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
            try {
                await api.delete(`/recruitment/applicants/${applicantId}`);
                if (onDelete) onDelete();
                onClose();
            } catch (err) {
                console.error('Failed to delete applicant:', err);
                alert('Failed to delete applicant. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Applicant Profile</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading profile...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : applicant ? (
                        <>
                            <div className={styles.profileHeader}>
                                <div className={styles.avatar}>
                                    <User size={32} />
                                </div>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.name}>{applicant.name}</h3>
                                    <div className={styles.contactGrid}>
                                        <div className={styles.contactItem}>
                                            <Mail size={16} /> {applicant.email}
                                        </div>
                                        <div className={styles.contactItem}>
                                            <Phone size={16} /> {applicant.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerActions}>
                                    {applicant.resume && (
                                        <a
                                            href={getResumeUrl(applicant.resume)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.resumeButton}
                                        >
                                            <Download size={16} />
                                            Resume
                                        </a>
                                    )}
                                    <button
                                        className={styles.deleteButton}
                                        onClick={handleDelete}
                                        title="Delete Applicant"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>
                                    <Briefcase size={18} /> Professional Summary
                                </h4>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Experience</span>
                                        <span className={styles.value}>{applicant.experience} Years</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Skills</span>
                                        <div className={styles.skillsList}>
                                            {applicant.skills.map((skill, idx) => (
                                                <span key={idx} className={styles.skillTag}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>
                                    <FileText size={18} /> Application History
                                </h4>
                                <div className={styles.applicationsList}>
                                    {applicant.applications.map((app, idx) => (
                                        <div key={idx} className={styles.applicationCard}>
                                            <div className={styles.appHeader}>
                                                <div className={styles.jobTitle}>
                                                    {app.job ? app.job.title : 'Unknown Job'}
                                                    <span className={styles.department}>
                                                        {app.job ? ` • ${app.job.department}` : ''}
                                                    </span>
                                                </div>
                                                <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <div className={styles.appMeta}>
                                                <Calendar size={14} /> Applied on {formatDate(app.appliedAt)}
                                            </div>
                                            {app.coverLetter && (
                                                <div className={styles.coverLetter}>
                                                    <p>{app.coverLetter}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfileModal;
