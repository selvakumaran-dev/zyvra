import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateEmployeeAccount from '../CreateEmployeeAccount';
import { useEmployeeAccount } from '../hooks/useEmployeeAccount';

// Mock the custom hook
vi.mock('../hooks/useEmployeeAccount');

describe('CreateEmployeeAccount Component', () => {
    const mockHookValues = {
        loading: false,
        searchTerm: '',
        setSearchTerm: vi.fn(),
        filteredEmployees: [
            { _id: '1', firstName: 'John', lastName: 'Doe', designation: 'Developer', email: 'john@example.com' }
        ],
        selectedEmployee: null,
        handleSelectEmployee: vi.fn(),
        getAccountStatus: vi.fn(),
        createdAccount: null,
        formData: { email: '', password: '' },
        setFormData: vi.fn(),
        handleSubmit: vi.fn(),
        message: { type: '', text: '' },
        handleDone: vi.fn(),
        resetting: false,
        handleResetDatabase: vi.fn(),
        showResetModal: false,
        setShowResetModal: vi.fn(),
        confirmReset: vi.fn(),
        showSuccessModal: false,
        handleSuccessClose: vi.fn(),
        deletionStats: null
    };

    it('renders the page title', () => {
        useEmployeeAccount.mockReturnValue(mockHookValues);
        render(<CreateEmployeeAccount />);
        expect(screen.getByText('Create Employee Account')).toBeInTheDocument();
    });

    it('renders the reset button', () => {
        useEmployeeAccount.mockReturnValue(mockHookValues);
        render(<CreateEmployeeAccount />);
        expect(screen.getByText('Reset Database')).toBeInTheDocument();
    });

    it('displays employee list', () => {
        useEmployeeAccount.mockReturnValue(mockHookValues);
        render(<CreateEmployeeAccount />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('shows placeholder when no employee selected', () => {
        useEmployeeAccount.mockReturnValue(mockHookValues);
        render(<CreateEmployeeAccount />);
        expect(screen.getByText('Select an Employee')).toBeInTheDocument();
    });

    it('shows form when employee is selected', () => {
        useEmployeeAccount.mockReturnValue({
            ...mockHookValues,
            selectedEmployee: mockHookValues.filteredEmployees[0]
        });
        render(<CreateEmployeeAccount />);
        expect(screen.getByText('Setup Account')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('calls handleResetDatabase when reset button is clicked', () => {
        useEmployeeAccount.mockReturnValue(mockHookValues);
        render(<CreateEmployeeAccount />);
        fireEvent.click(screen.getByText('Reset Database'));
        expect(mockHookValues.handleResetDatabase).toHaveBeenCalled();
    });
});
