import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Search, Filter, Download, Settings, ChevronUp, ChevronDown, FileSpreadsheet, X
} from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { exportToExcel } from '../../utils/excelExport';
import { showToast } from '../../utils/toast';
import styles from './DataTable.module.css';
import Button from './Button';

const DataTable = ({
    columns,
    data,
    onRowClick,
    actions,
    enableSearch = true,
    enableFilter = true,
    enableExport = true,
    enableColumnToggle = true,
    enablePagination = true,
    enableSorting = true,
    enableSelection = false,
    onBulkAction,
    bulkActions = [],
    pageSizeOptions = [10, 25, 50, 100],
    defaultPageSize = 25
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [visibleColumns, setVisibleColumns] = useState(
        columns.reduce((acc, col) => ({ ...acc, [col.accessor]: true }), {})
    );
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    // Filtering
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        return data.filter(row => {
            return columns.some(col => {
                const value = row[col.accessor];
                if (value === null || value === undefined) return false;
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, columns]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortConfig.direction === 'asc'
                ? aValue - bValue
                : bValue - aValue;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (!enablePagination) return sortedData;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize, enablePagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handlers
    const handleSort = (key) => {
        if (!enableSorting) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(paginatedData.map(row => row.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const handleExportCSV = () => {
        const visibleCols = columns.filter(col => visibleColumns[col.accessor]);
        const exportData = sortedData.map(row => {
            const obj = {};
            visibleCols.forEach(col => {
                obj[col.header] = row[col.accessor];
            });
            return obj;
        });

        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `export_${new Date().toISOString().split('T')[0]}.csv`);
        showToast.success('CSV exported successfully');
    };

    const handleExportExcel = () => {
        const visibleCols = columns.filter(col => visibleColumns[col.accessor]);
        const result = exportToExcel(sortedData, visibleCols, 'data_export');

        if (result.success) {
            showToast.success(`Excel file exported: ${result.filename}`);
        } else {
            showToast.error('Failed to export Excel file');
        }
    };

    const toggleColumn = (accessor) => {
        setVisibleColumns(prev => ({
            ...prev,
            [accessor]: !prev[accessor]
        }));
    };

    const visibleCols = columns.filter(col => visibleColumns[col.accessor]);

    return (
        <div className={styles.container}>
            {/* Bulk Actions Toolbar */}
            {enableSelection && selectedRows.size > 0 && (
                <div className={styles.bulkToolbar}>
                    <div className={styles.bulkInfo}>
                        <span className={styles.bulkCount}>{selectedRows.size} selected</span>
                        <button
                            className={styles.clearButton}
                            onClick={() => setSelectedRows(new Set())}
                        >
                            <X size={16} />
                            Clear
                        </button>
                    </div>
                    <div className={styles.bulkActions}>
                        {bulkActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    const selectedData = data.filter(row => selectedRows.has(row.id));
                                    action.onClick(selectedData, selectedRows);
                                }}
                            >
                                {action.icon && <action.icon size={16} />}
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.leftActions}>
                    {enableSearch && (
                        <div className={styles.search}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {enableExport && (
                        <>
                            <Button variant="secondary" size="small" onClick={handleExportExcel}>
                                <FileSpreadsheet size={16} />
                                Export Excel
                            </Button>
                            <Button variant="secondary" size="small" onClick={handleExportCSV}>
                                <Download size={16} />
                                Export CSV
                            </Button>
                        </>
                    )}
                    {enableColumnToggle && (
                        <div className={styles.columnMenuWrapper}>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                            >
                                <Settings size={16} />
                                Columns
                            </Button>
                            {showColumnMenu && (
                                <div className={styles.columnMenu}>
                                    {columns.map(col => (
                                        <label key={col.accessor} className={styles.columnMenuItem}>
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[col.accessor]}
                                                onChange={() => toggleColumn(col.accessor)}
                                            />
                                            <span>{col.header}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {actions}
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {enableSelection && (
                                <th className={styles.th} style={{ width: '50px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                    />
                                </th>
                            )}
                            {visibleCols.map((col) => (
                                <th
                                    key={col.accessor}
                                    className={`${styles.th} ${enableSorting ? styles.sortable : ''}`}
                                    style={{ width: col.width }}
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    <div className={styles.thContent}>
                                        <span>{col.header}</span>
                                        {enableSorting && sortConfig.key === col.accessor && (
                                            sortConfig.direction === 'asc'
                                                ? <ChevronUp size={14} />
                                                : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className={`${styles.tr} ${selectedRows.has(row.id) ? styles.selected : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {enableSelection && (
                                        <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                        </td>
                                    )}
                                    {visibleCols.map((col) => (
                                        <td key={col.accessor} className={styles.td}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={visibleCols.length + (enableSelection ? 1 : 0)}
                                    className={styles.emptyState}
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {enablePagination && (
                <div className={styles.pagination}>
                    <div className={styles.pageInfo}>
                        <span>
                            Showing {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className={styles.pageSelect}
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size} per page</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.pageControls}>
                        <button
                            className={styles.pageButton}
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            className={styles.pageButton}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className={styles.pageNumber}>
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            className={styles.pageButton}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className={styles.pageButton}
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Selection Info */}
            {enableSelection && selectedRows.size > 0 && (
                <div className={styles.selectionInfo}>
                    {selectedRows.size} row(s) selected
                    <button
                        className={styles.clearSelection}
                        onClick={() => setSelectedRows(new Set())}
                    >
                        Clear selection
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
