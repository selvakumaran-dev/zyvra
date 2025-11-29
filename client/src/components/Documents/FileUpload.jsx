import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

const FileUpload = ({ onUpload, accept, maxSize = 10485760, multiple = true }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            progress: 0,
            status: 'pending'
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple
    });

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleUpload = async () => {
        setUploading(true);

        for (const fileObj of files) {
            if (fileObj.status === 'uploaded') continue;

            try {
                // Simulate upload progress
                for (let progress = 0; progress <= 100; progress += 20) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    setFiles(prev => prev.map(f =>
                        f.id === fileObj.id ? { ...f, progress } : f
                    ));
                }

                setFiles(prev => prev.map(f =>
                    f.id === fileObj.id ? { ...f, status: 'uploaded' } : f
                ));

                if (onUpload) {
                    await onUpload(fileObj.file);
                }
            } catch (error) {
                setFiles(prev => prev.map(f =>
                    f.id === fileObj.id ? { ...f, status: 'error' } : f
                ));
            }
        }

        setUploading(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className={styles.container}>
            <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
            >
                <input {...getInputProps()} />
                <Upload size={48} className={styles.uploadIcon} />
                <p className={styles.dropzoneText}>
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
                </p>
                <p className={styles.dropzoneHint}>
                    Maximum file size: {formatFileSize(maxSize)}
                </p>
            </div>

            {files.length > 0 && (
                <div className={styles.fileList}>
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className={styles.fileItem}>
                            <div className={styles.fileIcon}>
                                {fileObj.status === 'uploaded' ? (
                                    <CheckCircle size={20} className={styles.successIcon} />
                                ) : (
                                    <File size={20} />
                                )}
                            </div>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{fileObj.file.name}</div>
                                <div className={styles.fileSize}>
                                    {formatFileSize(fileObj.file.size)}
                                </div>
                                {fileObj.progress > 0 && fileObj.status !== 'uploaded' && (
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${fileObj.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            {fileObj.status !== 'uploaded' && !uploading && (
                                <button
                                    className={styles.removeButton}
                                    onClick={() => removeFile(fileObj.id)}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && files.some(f => f.status !== 'uploaded') && (
                <button
                    className={styles.uploadButton}
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status !== 'uploaded').length} file(s)`}
                </button>
            )}
        </div>
    );
};

export default FileUpload;
