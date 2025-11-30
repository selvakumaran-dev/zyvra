import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './AddEmployeeModal.module.css';
import api from '../../services/api';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        designation: '',
        department: '',
        type: 'Full-Time',
        salary: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Bulk Import State
    const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
    const [bulkStep, setBulkStep] = useState('upload'); // 'upload' | 'preview' | 'result'
    const [bulkData, setBulkData] = useState([]);
    const [bulkErrors, setBulkErrors] = useState([]);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-generate email when firstName changes
            if (name === 'firstName' && value) {
                updated.email = `${value.toLowerCase()}@zyvra.com`;
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/employees', formData);
            onEmployeeAdded();
            onClose();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                designation: '',
                department: '',
                type: 'Full-Time',
                salary: ''
            });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    // Bulk Import Handlers
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Basic validation and formatting (NO EMAIL COLUMN)
                const formattedData = data.map((row, index) => ({
                    id: index,
                    firstName: row.firstName || row['First Name'] || '',
                    lastName: row.lastName || row['Last Name'] || '',
                    phoneNumber: row.phoneNumber || row['Phone Number'] || '',
                    address: row.address || row['Address'] || '',
                    designation: row.designation || row['Designation'] || '',
                    department: row.department || row['Department'] || '',
                    type: row.type || row['Type'] || 'Full-Time',
                    salary: row.salary || row['Salary'] || '',
                    isValid: true,
                    errors: {}
                }));

                validateBulkData(formattedData);
                setBulkData(formattedData);
                setBulkStep('preview');
            } catch (err) {
                setError('Failed to parse Excel file');
            }
        };
        reader.readAsBinaryString(file);
    };

    const validateBulkData = (data) => {
        let hasErrors = false;
        const validated = data.map(row => {
            const errors = {};
            if (!row.firstName) errors.firstName = 'Required';
            if (!row.lastName) errors.lastName = 'Required';
            if (!row.designation) errors.designation = 'Required';
            if (!row.department) errors.department = 'Required';

            const isValid = Object.keys(errors).length === 0;
            if (!isValid) hasErrors = true;

            return { ...row, isValid, errors };
        });
        setBulkData(validated);
        return !hasErrors;
    };

    const handleBulkCellChange = (id, field, value) => {
        setBulkData(prev => {
            const newData = prev.map(row => {
                if (row.id === id) {
                    return { ...row, [field]: value };
                }
                return row;
            });
            validateBulkData(newData);
            return newData;
        });
    };

    const handleBulkSubmit = async () => {
        setLoading(true);
        setError('');

        const validRows = bulkData.filter(row => row.isValid).map(({ id, isValid, errors, ...rest }) => rest);

        if (validRows.length === 0) {
            setError('No valid data to import');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/employees/bulk', validRows);
            const { success, errors } = res.data.data;

            if (errors.length > 0) {
                setBulkErrors(errors);
                setError(`Imported ${success.length} employees. ${errors.length} failed.`);
            } else {
                onEmployeeAdded();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to import employees');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            { 'First Name': 'John', 'Last Name': 'Doe', 'Designation': 'Developer', 'Department': 'Engineering', 'Type': 'Full-Time', 'Salary': 50000, 'Phone Number': '', 'Address': '' }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "employee_import_template.xlsx");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee" width="800px">
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'single' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('single')}
                >
                    Single Entry
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'bulk' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('bulk')}
                >
                    Bulk Import
                </button>
            </div>

            {activeTab === 'single' ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="Auto-generated from first name"
                            readOnly
                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="+91 234 567 8900"
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Address</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="123 Main St, City"
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>Designation</label>
                            <input
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className={styles.select}
                            >
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="HR">HR</option>
                                <option value="Product">Product</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>Employment Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Intern">Intern</option>
                            </select>
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Base Salary</label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Employee'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    {bulkStep === 'upload' && (
                        <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                            <p>Click to upload Excel file (.xlsx, .xls)</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', marginTop: '8px' }}>
                                Email will be auto-generated from first name
                            </p>
                            <Button type="button" variant="ghost" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}>
                                Download Template
                            </Button>
                        </div>
                    )}

                    {bulkStep === 'preview' && (
                        <>
                            <div className={styles.summary}>
                                <p><strong>{bulkData.filter(r => r.isValid).length}</strong> valid rows ready to import.</p>
                                <p><strong>{bulkData.filter(r => !r.isValid).length}</strong> rows with errors (highlighted).</p>
                            </div>

                            <div className={styles.previewContainer}>
                                <table className={styles.previewTable}>
                                    <thead>
                                        <tr>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>Designation</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkData.map((row) => (
                                            <tr key={row.id} className={!row.isValid ? styles.invalidRow : ''}>
                                                <td>
                                                    <input
                                                        value={row.firstName}
                                                        onChange={(e) => handleBulkCellChange(row.id, 'firstName', e.target.value)}
                                                        className={`${styles.input} ${row.errors.firstName ? styles.errorInput : ''}`}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={row.lastName}
                                                        onChange={(e) => handleBulkCellChange(row.id, 'lastName', e.target.value)}
                                                        className={`${styles.input} ${row.errors.lastName ? styles.errorInput : ''}`}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={row.designation}
                                                        onChange={(e) => handleBulkCellChange(row.id, 'designation', e.target.value)}
                                                        className={`${styles.input} ${row.errors.designation ? styles.errorInput : ''}`}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={row.department}
                                                        onChange={(e) => handleBulkCellChange(row.id, 'department', e.target.value)}
                                                        className={`${styles.select} ${row.errors.department ? styles.errorInput : ''}`}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Engineering">Engineering</option>
                                                        <option value="Sales">Sales</option>
                                                        <option value="Marketing">Marketing</option>
                                                        <option value="HR">HR</option>
                                                        <option value="Product">Product</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {row.isValid ? '✅' : '❌'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.actions}>
                                <Button type="button" variant="ghost" onClick={() => setBulkStep('upload')}>Back</Button>
                                <Button type="button" onClick={handleBulkSubmit} disabled={loading}>
                                    {loading ? 'Importing...' : 'Import Valid Rows'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default AddEmployeeModal;
