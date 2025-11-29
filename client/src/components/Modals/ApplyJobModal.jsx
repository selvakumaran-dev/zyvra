import React, { useState } from 'react';
import { X, Briefcase, FileText, Award, Upload } from 'lucide-react';
import Button from '../UI/Button';
import api from '../../services/api';
import styles from './ApplyJobModal.module.css';

const ApplyJobModal = ({ isOpen, onClose, job, onApplicationSubmitted, isPublic = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        coverLetter: '',
        yearsOfExperience: '',
        skills: '',
        resume: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF or Word document');
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setError('');
            setFormData({
                ...formData,
                resume: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.resume) {
            setError('Please upload your resume');
            return;
        }

        setLoading(true);

        try {
            const skillsArray = formData.skills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0);

            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('resume', formData.resume);
            submitData.append('coverLetter', formData.coverLetter);
            submitData.append('yearsOfExperience', parseInt(formData.yearsOfExperience) || 0);
            submitData.append('skills', JSON.stringify(skillsArray));

            if (isPublic) {
                submitData.append('firstName', formData.firstName);
                submitData.append('lastName', formData.lastName);
                submitData.append('email', formData.email);
                submitData.append('phone', formData.phone);
            }

            const endpoint = isPublic
                ? `/recruitment/public/jobs/${job._id}/apply`
                : `/recruitment/jobs/${job._id}/apply`;

            await api.post(endpoint, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                coverLetter: '',
                yearsOfExperience: '',
                skills: '',
                resume: null
            });

            if (onApplicationSubmitted) {
                onApplicationSubmitted();
            }

            onClose();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !job) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Apply for Position</h2>
                        <p className={styles.jobTitle}>
                            <Briefcase size={16} />
                            {job.title}
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.jobInfo}>
                        <div className={styles.infoItem}>
                            <strong>Department:</strong> {job.department}
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Location:</strong> {job.location}
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Type:</strong> {job.type}
                        </div>
                    </div>

                    {isPublic && (
                        <>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Award size={18} />
                            Years of Experience *
                        </label>
                        <input
                            type="number"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g., 3"
                            min="0"
                            max="50"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Award size={18} />
                            Skills (comma-separated) *
                        </label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g., React, Node.js, MongoDB"
                            required
                        />
                        <span className={styles.hint}>Separate multiple skills with commas</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Upload size={18} />
                            Resume (PDF/Word) *
                        </label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                type="file"
                                name="resume"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                accept=".pdf,.doc,.docx"
                                required
                            />
                            <div className={styles.fileInputDisplay}>
                                {formData.resume ? (
                                    <span className={styles.fileName}>
                                        <FileText size={16} />
                                        {formData.resume.name}
                                    </span>
                                ) : (
                                    <span className={styles.placeholder}>Click to upload resume</span>
                                )}
                            </div>
                        </div>
                        <span className={styles.hint}>Max file size: 5MB</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FileText size={18} />
                            Cover Letter *
                        </label>
                        <textarea
                            name="coverLetter"
                            value={formData.coverLetter}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Tell us why you're a great fit for this position..."
                            rows="6"
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyJobModal;
