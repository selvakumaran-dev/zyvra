import React from 'react';
import { Trash2, User } from 'lucide-react';
import styles from './CreateEmployeeAccount.module.css';
import ResetConfirmModal from '../../components/Modals/ResetConfirmModal';
import ResetSuccessModal from '../../components/Modals/ResetSuccessModal';
import { useEmployeeAccount } from './hooks/useEmployeeAccount';
import EmployeeList from './components/EmployeeList';
import CreateAccountForm from './components/CreateAccountForm';
import AccountSuccessView from './components/AccountSuccessView';

const CreateEmployeeAccount = () => {
    const {
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
    } = useEmployeeAccount();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Create Employee Account</h1>
                    <p className={styles.subtitle}>Generate secure login credentials for your workforce</p>
                </div>
                <button
                    onClick={handleResetDatabase}
                    className={styles.resetButton}
                    disabled={resetting}
                    title="Reset Database - Delete all data except HR admin"
                >
                    <Trash2 size={18} />
                    {resetting ? 'Resetting...' : 'Reset Database'}
                </button>
            </div>

            <div className={styles.content}>
                <EmployeeList
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredEmployees={filteredEmployees}
                    selectedEmployee={selectedEmployee}
                    onSelectEmployee={handleSelectEmployee}
                    getAccountStatus={getAccountStatus}
                />

                <div className={styles.rightPanel}>
                    {createdAccount ? (
                        <AccountSuccessView
                            createdAccount={createdAccount}
                            onDone={handleDone}
                        />
                    ) : selectedEmployee ? (
                        <CreateAccountForm
                            selectedEmployee={selectedEmployee}
                            formData={formData}
                            setFormData={setFormData}
                            handleSubmit={handleSubmit}
                            message={message}
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}>
                                <User size={40} />
                            </div>
                            <h3>Select an Employee</h3>
                            <p>Choose an employee from the list on the left to generate their login credentials and set up their account access.</p>
                        </div>
                    )}
                </div>
            </div>

            <ResetConfirmModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={confirmReset}
                loading={resetting}
            />

            <ResetSuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                deletionStats={deletionStats}
            />
        </div>
    );
};

export default CreateEmployeeAccount;
