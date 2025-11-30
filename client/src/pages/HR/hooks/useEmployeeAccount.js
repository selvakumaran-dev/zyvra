import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useEmployeeAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [createdAccount, setCreatedAccount] = useState(null);
    const [resetting, setResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deletionStats, setDeletionStats] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, userRes] = await Promise.all([
                api.get('/employees'),
                api.get('/auth/users')
            ]);
            setEmployees(empRes.data.data);
            setUsers(userRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmployee = (employee) => {
        const existingUser = users.find(u => u.employee?._id === employee._id);
        if (existingUser) {
            alert(`Account already exists for ${employee.firstName} ${employee.lastName} (${existingUser.email})`);
            return;
        }

        setSelectedEmployee(employee);
        setFormData({
            email: employee.email,
            password: 'password123'
        });
        setMessage({ type: '', text: '' });
        setCreatedAccount(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                employeeId: selectedEmployee._id
            });

            setCreatedAccount({
                name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
                email: formData.email,
                password: formData.password
            });

            setMessage({ type: '', text: '' });
            fetchData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to create account'
            });
        }
    };

    const handleDone = () => {
        setCreatedAccount(null);
        setSelectedEmployee(null);
        setFormData({ email: '', password: '' });
    };

    const handleResetDatabase = () => {
        setShowResetModal(true);
    };

    const confirmReset = async () => {
        setShowResetModal(false);
        setResetting(true);

        try {
            const response = await api.post('/reset/database');
            setDeletionStats(response.data.data.deletedRecords);
            setShowSuccessModal(true);
            fetchData();
            setSelectedEmployee(null);
            setCreatedAccount(null);
        } catch (error) {
            alert('❌ Reset Failed: ' + (error.response?.data?.error?.message || 'Error'));
        } finally {
            setResetting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        setDeletionStats(null);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.status !== 'Terminated' &&
        (emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getAccountStatus = (employeeId) => {
        return users.find(u => u.employee?._id === employeeId);
    };

    return {
        loading,
        searchTerm,
        setSearchTerm,
        filteredEmployees,
        selectedEmployee,
        handleSelectEmployee,
        getAccountStatus,
        createdAccount,
        formData,
        setFormData,
        handleSubmit,
        message,
        handleDone,
        resetting,
        handleResetDatabase,
        showResetModal,
        setShowResetModal,
        confirmReset,
        showSuccessModal,
        handleSuccessClose,
        deletionStats
    };
};
