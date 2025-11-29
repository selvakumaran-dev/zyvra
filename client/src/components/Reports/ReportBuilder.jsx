import React, { useState, useEffect } from 'react';
import {
    FileText,
    Users,
    DollarSign,
    Briefcase,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Download,
    Save,
    Filter,
    Columns
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './ReportBuilder.module.css';

const DATA_SOURCES = [
    { id: 'employees', name: 'Employees', icon: Users, description: 'Employee records, status, and details' },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, description: 'Salary, bonuses, and payment history' },
    { id: 'recruitment', name: 'Recruitment', icon: Briefcase, description: 'Candidates, jobs, and applications' }
];

const AVAILABLE_FIELDS = {
    employees: [
        { id: 'firstName', label: 'First Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'email', label: 'Email' },
        { id: 'department', label: 'Department' },
        { id: 'designation', label: 'Designation' },
        { id: 'status', label: 'Status' },
        { id: 'type', label: 'Employment Type' },
        { id: 'joiningDate', label: 'Joining Date' },
        { id: 'salary', label: 'Salary' }
    ],
    payroll: [
        { id: 'employee', label: 'Employee ID' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' },
        { id: 'basicSalary', label: 'Basic Salary' },
        { id: 'netPay', label: 'Net Salary' },
        { id: 'status', label: 'Status' },
        { id: 'paymentDate', label: 'Payment Date' }
    ],
    recruitment: [
        { id: 'firstName', label: 'First Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone' },
        { id: 'status', label: 'Status' },
        { id: 'experience', label: 'Experience' },
        { id: 'expectedSalary', label: 'Expected Salary' }
    ]
};

const ReportBuilder = ({ editingReport, onSaved }) => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        name: '',
        description: '',
        dataSource: '',
        fields: [],
        filters: []
    });
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load editing report
    useEffect(() => {
        if (editingReport) {
            setConfig({
                name: editingReport.name,
                description: editingReport.description || '',
                dataSource: editingReport.dataSource,
                fields: editingReport.config.fields,
                filters: editingReport.config.filters || [],
                sortBy: editingReport.config.sortBy
            });
        }
    }, [editingReport]);

    const handleNext = async () => {
        if (step === 3) {
            await fetchPreview();
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const fetchPreview = async () => {
        setLoading(true);
        try {
            const response = await api.post('/reports/preview', {
                dataSource: config.dataSource,
                config: {
                    fields: config.fields,
                    filters: config.filters
                }
            });
            setPreviewData(response.data.data);
        } catch (error) {
            showToast.error('Failed to generate preview');
        } finally {
            setLoading(false);
        }
    };

    const saveReport = async () => {
        setSaving(true);
        try {
            const reportData = {
                name: config.name,
                description: config.description,
                dataSource: config.dataSource,
                config: {
                    fields: config.fields,
                    filters: config.filters,
                    sortBy: config.sortBy
                }
            };

            if (editingReport) {
                await api.put(`/reports/${editingReport._id}`, reportData);
                showToast.success('Report updated successfully');
            } else {
                await api.post('/reports', reportData);
                showToast.success('Report saved successfully');
            }

            if (onSaved) onSaved();
        } catch (error) {
            showToast.error('Failed to save report');
        } finally {
            setSaving(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text(config.name || 'Untitled Report', 14, 22);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Source: ${DATA_SOURCES.find(s => s.id === config.dataSource)?.name}`, 14, 35);

        // Table
        const tableColumn = config.fields.map(fieldId =>
            AVAILABLE_FIELDS[config.dataSource].find(f => f.id === fieldId)?.label || fieldId
        );

        const tableRows = previewData.map(item =>
            config.fields.map(field => {
                // Handle nested or special values if needed
                return item[field] || '-';
            })
        );

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`${config.name || 'report'}.pdf`);
        showToast.success('Report downloaded successfully');
    };

    const renderStep1 = () => (
        <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Select Data Source</h2>
            <div className={styles.sourceGrid}>
                {DATA_SOURCES.map(source => (
                    <div
                        key={source.id}
                        className={`${styles.sourceCard} ${config.dataSource === source.id ? styles.selected : ''}`}
                        onClick={() => setConfig({ ...config, dataSource: source.id, fields: [] })}
                    >
                        <source.icon size={32} className={styles.sourceIcon} />
                        <h3>{source.name}</h3>
                        <p>{source.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Select Fields</h2>
            <div className={styles.fieldsGrid}>
                {AVAILABLE_FIELDS[config.dataSource]?.map(field => (
                    <label key={field.id} className={styles.fieldCheckbox}>
                        <input
                            type="checkbox"
                            checked={config.fields.includes(field.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setConfig({ ...config, fields: [...config.fields, field.id] });
                                } else {
                                    setConfig({ ...config, fields: config.fields.filter(f => f !== field.id) });
                                }
                            }}
                        />
                        <span>{field.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Report Details</h2>
            <div className={styles.formGroup}>
                <label>Report Name</label>
                <input
                    type="text"
                    className={styles.input}
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="e.g., Monthly Employee Report"
                />
            </div>

            <div className={styles.formGroup}>
                <label>Description (Optional)</label>
                <textarea
                    className={styles.textarea}
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    placeholder="Brief description of this report"
                    rows={3}
                />
            </div>

            <div className={styles.filtersSection}>
                <h3>Filters</h3>
                {config.filters.map((filter, index) => (
                    <div key={index} className={styles.filterRow}>
                        <select
                            value={filter.field}
                            onChange={(e) => {
                                const newFilters = [...config.filters];
                                newFilters[index].field = e.target.value;
                                setConfig({ ...config, filters: newFilters });
                            }}
                            className={styles.select}
                        >
                            <option value="">Select Field</option>
                            {AVAILABLE_FIELDS[config.dataSource]?.map(f => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </select>
                        <select
                            value={filter.operator}
                            onChange={(e) => {
                                const newFilters = [...config.filters];
                                newFilters[index].operator = e.target.value;
                                setConfig({ ...config, filters: newFilters });
                            }}
                            className={styles.select}
                        >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="gt">Greater Than</option>
                            <option value="lt">Less Than</option>
                        </select>
                        <input
                            type="text"
                            value={filter.value}
                            onChange={(e) => {
                                const newFilters = [...config.filters];
                                newFilters[index].value = e.target.value;
                                setConfig({ ...config, filters: newFilters });
                            }}
                            className={styles.input}
                            placeholder="Value"
                        />
                        <button
                            className={styles.removeButton}
                            onClick={() => {
                                const newFilters = config.filters.filter((_, i) => i !== index);
                                setConfig({ ...config, filters: newFilters });
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    className={styles.addButton}
                    onClick={() => setConfig({
                        ...config,
                        filters: [...config.filters, { field: '', operator: 'equals', value: '' }]
                    })}
                >
                    + Add Filter
                </button>
            </div>

            <div className={styles.filtersSection}>
                <h3>Sorting</h3>
                <div className={styles.filterRow}>
                    <select
                        value={config.sortBy?.field || ''}
                        onChange={(e) => setConfig({
                            ...config,
                            sortBy: { field: e.target.value, order: config.sortBy?.order || 'asc' }
                        })}
                        className={styles.select}
                    >
                        <option value="">None</option>
                        {AVAILABLE_FIELDS[config.dataSource]?.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>
                    {config.sortBy?.field && (
                        <select
                            value={config.sortBy?.order || 'asc'}
                            onChange={(e) => setConfig({
                                ...config,
                                sortBy: { ...config.sortBy, order: e.target.value }
                            })}
                            className={styles.select}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.previewHeader}>
                <h2 className={styles.stepTitle}>Preview Report</h2>
                <div className={styles.previewActions}>
                    <button className={styles.saveButton} onClick={saveReport} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : editingReport ? 'Update Report' : 'Save Report'}
                    </button>
                    <button className={styles.exportButton} onClick={exportPDF}>
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className={styles.previewTableWrapper}>
                <table className={styles.previewTable}>
                    <thead>
                        <tr>
                            {config.fields.map(fieldId => (
                                <th key={fieldId}>
                                    {AVAILABLE_FIELDS[config.dataSource].find(f => f.id === fieldId)?.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={config.fields.length} className={styles.loadingCell}>Loading preview...</td></tr>
                        ) : previewData.length === 0 ? (
                            <tr><td colSpan={config.fields.length} className={styles.emptyCell}>No data found</td></tr>
                        ) : (
                            previewData.map((row, i) => (
                                <tr key={i}>
                                    {config.fields.map(field => (
                                        <td key={field}>{row[field] || '-'}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.steps}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`${styles.stepIndicator} ${step === s ? styles.activeStep : ''} ${step > s ? styles.completedStep : ''}`}>
                            <div className={styles.stepNumber}>{step > s ? <FileText size={14} /> : s}</div>
                            <span className={styles.stepLabel}>
                                {s === 1 ? 'Source' : s === 2 ? 'Fields' : s === 3 ? 'Details' : 'Preview'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.content}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className={styles.footer}>
                    <button
                        className={styles.backButton}
                        onClick={handleBack}
                        disabled={step === 1}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>
                    <button
                        className={styles.nextButton}
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !config.dataSource) ||
                            (step === 2 && config.fields.length === 0) ||
                            (step === 3 && !config.name) ||
                            step === 4
                        }
                    >
                        {step === 4 ? 'Finish' : 'Next'}
                        {step !== 4 && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportBuilder;
