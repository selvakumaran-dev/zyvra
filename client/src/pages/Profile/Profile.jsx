import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Calendar, FileText, Upload, MapPin, Phone, Edit2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import EditProfileModal from '../../components/Modals/EditProfileModal';
import ImageCropModal from '../../components/Modals/ImageCropModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Profile.module.css';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [employee, setEmployee] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data.data;

            if (userData.user && userData.user.employee) {
                const empResponse = await api.get(`/employees/${userData.user.employee._id}`);
                setEmployee(empResponse.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedEmployee) => {
        setEmployee(updatedEmployee);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedImageBlob) => {
        if (!croppedImageBlob) return;

        const formData = new FormData();
        formData.append('avatar', croppedImageBlob, 'avatar.jpg');

        try {
            const response = await api.post(`/employees/${employee._id}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setEmployee(response.data.data);

            setTimeout(() => {
                fetchProfile();
            }, 500);

            alert('Photo uploaded successfully!');
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Failed to upload photo. Please try again.');
        }
    };

    if (loading) return <div className={styles.loading}>Loading profile...</div>;
    if (!employee) return <div className={styles.error}>Profile not found. Please contact HR.</div>;

    const docColumns = [
        { header: 'Document Name', accessor: 'title' },
        { header: 'Type', accessor: 'type' },
        {
            header: 'Uploaded Date',
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
            header: 'Action',
            render: () => <Button variant="ghost" size="small">Download</Button>
        }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarContainer}>
                        {employee.avatar ? (
                            <img
                                src={`http://localhost:5000${employee.avatar}`}
                                alt="Profile"
                                className={styles.avatarImage}
                            />
                        ) : (
                            <div className={styles.avatarLarge}>
                                {employee.firstName.charAt(0)}
                            </div>
                        )}
                        <label htmlFor="avatar-upload" className={styles.uploadButton}>
                            <Upload size={16} />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <div>
                        <h1 className={styles.name}>{employee.firstName} {employee.lastName}</h1>
                        <p className={styles.role}>{employee.designation} • {employee.department}</p>
                        <div className={styles.status}>
                            <Badge variant="success">{employee.status}</Badge>
                            <span className={styles.joinDate}>Joined {new Date(employee.joiningDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                    <Edit2 size={16} style={{ marginRight: '8px' }} />
                    Edit Profile
                </Button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal Info
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'payslips' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('payslips')}
                >
                    Payslips
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'personal' && (
                    <div className={styles.grid}>
                        <Card title="Contact Information">
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><Mail size={18} /></div>
                                <div>
                                    <div className={styles.label}>Email Address</div>
                                    <div className={styles.value}>{employee.email}</div>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><Phone size={18} /></div>
                                <div>
                                    <div className={styles.label}>Phone Number</div>
                                    <div className={styles.value}>{employee.phoneNumber || 'Not provided'}</div>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><MapPin size={18} /></div>
                                <div>
                                    <div className={styles.label}>Address</div>
                                    <div className={styles.value}>{employee.address || 'Not provided'}</div>
                                </div>
                            </div>
                        </Card>
                        <Card title="Employment Details">
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><User size={18} /></div>
                                <div>
                                    <div className={styles.label}>Employee ID</div>
                                    <div className={styles.value}>{employee._id.substring(0, 8).toUpperCase()}</div>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><Calendar size={18} /></div>
                                <div>
                                    <div className={styles.label}>Employment Type</div>
                                    <div className={styles.value}>{employee.type}</div>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.icon}><Briefcase size={18} /></div>
                                <div>
                                    <div className={styles.label}>Department</div>
                                    <div className={styles.value}>{employee.department}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <Card title="My Documents" action={<Button size="small"><Upload size={16} /> Upload</Button>}>
                        {documents.length > 0 ? (
                            <DataTable columns={docColumns} data={documents} />
                        ) : (
                            <div className={styles.emptyState}>
                                <FileText size={48} />
                                <p>No documents found</p>
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'payslips' && (
                    <Card title="Recent Payslips">
                        {payslips.length > 0 ? (
                            <div className={styles.payslipList}>
                                {payslips.map(slip => (
                                    <div key={slip._id} className={styles.payslipItem}>
                                        <div className={styles.payslipIcon}><FileText size={24} /></div>
                                        <div className={styles.payslipInfo}>
                                            <div className={styles.payslipTitle}>Payslip - {slip.month}/{slip.year}</div>
                                            <div className={styles.payslipDate}>Processed on {new Date(slip.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className={styles.payslipAmount}>${slip.netPay.toLocaleString()}</div>
                                        <Button variant="ghost" size="small">Download PDF</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <FileText size={40} />
                                </div>
                                <h3>No Payslips Available</h3>
                                <p>You haven't received any payslips yet.</p>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    employee={employee}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}

            {isCropModalOpen && (
                <ImageCropModal
                    isOpen={isCropModalOpen}
                    onClose={() => {
                        setIsCropModalOpen(false);
                        setSelectedImage(null);
                    }}
                    imageSrc={selectedImage}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};

export default Profile;
