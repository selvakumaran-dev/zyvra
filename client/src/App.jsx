import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout, { SearchContext } from './components/Layout/MainLayout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Toast from './components/UI/Toast';
import GlobalSearch from './components/Search/GlobalSearch';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Lazy load pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Careers = lazy(() => import('./pages/Public/Careers'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Employees = lazy(() => import('./pages/Employees/Employees'));
const CreateEmployeeAccount = lazy(() => import('./pages/HR/CreateEmployeeAccount'));
const Recruitment = lazy(() => import('./pages/Recruitment/Recruitment'));
const Payroll = lazy(() => import('./pages/Payroll/Payroll'));
const Performance = lazy(() => import('./pages/Performance/Performance'));
const Compliance = lazy(() => import('./pages/Compliance/Compliance'));
const Attendance = lazy(() => import('./pages/Attendance/Attendance'));
const Leave = lazy(() => import('./pages/Leave/Leave'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const OrgChart = lazy(() => import('./pages/OrgChart/OrgChart'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Workflows = lazy(() => import('./pages/Workflows/Workflows'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Integrations = lazy(() => import('./pages/Integrations/Integrations'));
const Security = lazy(() => import('./pages/Security/Security'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
import AIAssistant from './components/AI/AIAssistant';

function AppContent() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/careers" element={<Careers />} />

          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="employees" element={<PrivateRoute roles={['HR']}><Employees /></PrivateRoute>} />
            <Route path="employees/create-account" element={<PrivateRoute roles={['HR']}><CreateEmployeeAccount /></PrivateRoute>} />
            <Route path="org-chart" element={<OrgChart />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="recruitment" element={<PrivateRoute roles={['HR', 'Applicant']}><Recruitment /></PrivateRoute>} />
            <Route path="payroll" element={<PrivateRoute roles={['HR']}><Payroll /></PrivateRoute>} />
            <Route path="performance" element={<Performance />} />
            <Route path="compliance" element={<PrivateRoute roles={['HR']}><Compliance /></PrivateRoute>} />
            <Route path="reports" element={<PrivateRoute roles={['HR', 'ADMIN']}><Reports /></PrivateRoute>} />
            <Route path="workflows" element={<PrivateRoute roles={['HR', 'ADMIN']}><Workflows /></PrivateRoute>} />
            <Route path="analytics" element={<PrivateRoute roles={['HR', 'ADMIN']}><Analytics /></PrivateRoute>} />
            <Route path="integrations" element={<PrivateRoute roles={['HR', 'ADMIN']}><Integrations /></PrivateRoute>} />
            <Route path="security" element={<PrivateRoute roles={['HR', 'ADMIN']}><Security /></PrivateRoute>} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AppContent />
              <AIAssistant />
              <Toast />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
