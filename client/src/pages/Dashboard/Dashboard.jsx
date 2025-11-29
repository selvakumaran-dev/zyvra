import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardBuilder from '../../components/Dashboard/DashboardBuilder';
import EmployeeDashboard from '../../components/Dashboard/EmployeeDashboard';
import ApplicantDashboard from '../../components/Dashboard/ApplicantDashboard';

const Dashboard = () => {
    const { isHR, isApplicant } = useAuth();

    if (isApplicant) return <ApplicantDashboard />;
    return isHR ? <DashboardBuilder /> : <EmployeeDashboard />;
};

export default Dashboard;
