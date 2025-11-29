import React, { useState, useEffect } from 'react';
import { User, Search, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronUp, Users as UsersIcon } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import EmployeeDetailsModal from '../../components/Modals/EmployeeDetailsModal';
import Skeleton from '../../components/UI/Skeleton';
import api from '../../services/api';
import styles from './OrgChart.module.css';

const TreeNode = ({ employee, allEmployees, onEmployeeClick, searchTerm, selectedDepartment }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const subordinates = allEmployees.filter(e => e.manager === employee._id && e.status !== 'Terminated');

    // Highlight if matches search
    const matchesSearch = searchTerm && (
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by department
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;

    if (!matchesDepartment && !subordinates.some(s => s.department === selectedDepartment)) {
        return null;
    }

    return (
        <div className={styles.nodeWrapper}>
            <div
                className={`${styles.nodeCard} ${matchesSearch ? styles.highlighted : ''}`}
                onClick={() => onEmployeeClick(employee)}
            >
                <div className={styles.avatar}>
                    {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.firstName} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{employee.firstName} {employee.lastName}</div>
                    <div className={styles.role}>{employee.designation}</div>
                    <div className={styles.department}>{employee.department}</div>
                </div>
                {subordinates.length > 0 && (
                    <div className={styles.badges}>
                        <Badge variant="info" className={styles.countBadge}>
                            <UsersIcon size={12} />
                            {subordinates.length}
                        </Badge>
                    </div>
                )}
                {subordinates.length > 0 && (
                    <button
                        className={styles.collapseBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCollapsed(!isCollapsed);
                        }}
                    >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                )}
            </div>
            {subordinates.length > 0 && !isCollapsed && (
                <div className={styles.children}>
                    {subordinates.map(sub => (
                        <TreeNode
                            key={sub._id}
                            employee={sub}
                            allEmployees={allEmployees}
                            onEmployeeClick={onEmployeeClick}
                            searchTerm={searchTerm}
                            selectedDepartment={selectedDepartment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrgChart = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [zoom, setZoom] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoom(1);

    // Get unique departments
    const departments = [...new Set(employees.map(e => e.department))].filter(Boolean);

    // Find root nodes (employees with no manager or manager not in list)
    const activeEmployees = employees.filter(e => e.status !== 'Terminated');
    const rootNodes = activeEmployees.filter(e => !e.manager || !activeEmployees.find(m => m._id === e.manager));

    // Calculate stats
    const totalEmployees = activeEmployees.length;
    const totalDepartments = departments.length;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Organization Chart</h1>
                    <p className={styles.subtitle}>
                        {totalEmployees} employees across {totalDepartments} departments
                    </p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={styles.departmentFilter}
                >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>

                <div className={styles.zoomControls}>
                    <Button variant="ghost" size="small" onClick={handleZoomOut}>
                        <ZoomOut size={18} />
                    </Button>
                    <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="small" onClick={handleZoomIn}>
                        <ZoomIn size={18} />
                    </Button>
                    <Button variant="ghost" size="small" onClick={handleResetZoom}>
                        <Maximize2 size={18} />
                    </Button>
                </div>
            </div>

            <div className={styles.chartContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <Skeleton.Card height="400px" width="100%" />
                    </div>
                ) : (
                    <div
                        className={styles.tree}
                        style={{ transform: `scale(${zoom})` }}
                    >
                        {rootNodes.map(root => (
                            <TreeNode
                                key={root._id}
                                employee={root}
                                allEmployees={activeEmployees}
                                onEmployeeClick={handleEmployeeClick}
                                searchTerm={searchTerm}
                                selectedDepartment={selectedDepartment}
                            />
                        ))}
                    </div>
                )}
            </div>

            <EmployeeDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
};

export default OrgChart;
