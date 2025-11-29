import React, { useState } from 'react';
import { FileText, Download, Trash2, Search } from 'lucide-react';
import FileUpload from './FileUpload';
import Button from '../UI/Button';
import styles from './DocumentManager.module.css';

const DocumentManager = ({ employeeId }) => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    const handleUpload = async (file) => {
        // Simulate upload - in real app, this would call API
        const newDoc = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            category: 'General'
        };
        setDocuments(prev => [newDoc, ...prev]);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this document?')) {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Documents</h2>
                <Button onClick={() => setShowUpload(!showUpload)}>
                    {showUpload ? 'Cancel' : 'Upload Document'}
                </Button>
            </div>

            {showUpload && (
                <div className={styles.uploadSection}>
                    <FileUpload
                        onUpload={handleUpload}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'image/*': ['.png', '.jpg', '.jpeg'],
                            'application/msword': ['.doc', '.docx']
                        }}
                    />
                </div>
            )}

            <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search documents..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.documentList}>
                {filteredDocs.length > 0 ? (
                    filteredDocs.map(doc => (
                        <div key={doc.id} className={styles.documentItem}>
                            <div className={styles.docIcon}>
                                <FileText size={24} />
                            </div>
                            <div className={styles.docInfo}>
                                <div className={styles.docName}>{doc.name}</div>
                                <div className={styles.docMeta}>
                                    {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                                </div>
                            </div>
                            <div className={styles.docActions}>
                                <button className={styles.actionButton} title="Download">
                                    <Download size={18} />
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => handleDelete(doc.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <FileText size={48} className={styles.emptyIcon} />
                        <p>No documents found</p>
                        <p className={styles.emptyHint}>
                            {searchTerm ? 'Try a different search term' : 'Upload your first document to get started'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
