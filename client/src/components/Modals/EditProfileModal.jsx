import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import styles from './EditProfileModal.module.css';

const countryCodes = [
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+86', country: 'China' },
    { code: '+55', country: 'Brazil' },
    { code: '+7', country: 'Russia' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+82', country: 'South Korea' },
    { code: '+31', country: 'Netherlands' },
    { code: '+46', country: 'Sweden' },
    { code: '+41', country: 'Switzerland' },
    { code: '+65', country: 'Singapore' },
    { code: '+971', country: 'UAE' },
    { code: '+27', country: 'South Africa' },
    // Add more as needed
].sort((a, b) => a.country.localeCompare(b.country));

const EditProfileModal = ({ employee, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (employee) {
            // Try to parse existing phone number
            let initialPhone = employee.phoneNumber || employee.phone || '';
            let initialCode = '+91';

            // Simple check if phone starts with a known code
            const foundCode = countryCodes.find(c => initialPhone.startsWith(c.code));
            if (foundCode) {
                initialCode = foundCode.code;
                initialPhone = initialPhone.replace(foundCode.code, '').trim();
            }

            setSelectedCountryCode(initialCode);
            setPhoneNumber(initialPhone);

            // Parse address string into components (if it's a string)
            let addressData = {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            };

            if (typeof employee.address === 'string' && employee.address) {
                // Try to parse the address string
                const parts = employee.address.split(',').map(p => p.trim());
                if (parts.length >= 1) addressData.street = parts[0] || '';
                if (parts.length >= 2) addressData.city = parts[1] || '';
                if (parts.length >= 3) addressData.state = parts[2] || '';
                if (parts.length >= 4) addressData.zipCode = parts[3] || '';
                if (parts.length >= 5) addressData.country = parts[4] || '';
            } else if (typeof employee.address === 'object' && employee.address) {
                // If it's already an object, use it
                addressData = { ...employee.address };
            }

            setFormData({
                phone: employee.phoneNumber || employee.phone || '',
                address: addressData
            });
        }
    }, [employee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePhoneChange = (e) => {
        setPhoneNumber(e.target.value);
        // Update main formData immediately
        setFormData(prev => ({
            ...prev,
            phone: `${selectedCountryCode} ${e.target.value}`
        }));
    };

    const handleCodeChange = (e) => {
        setSelectedCountryCode(e.target.value);
        // Update main formData immediately
        setFormData(prev => ({
            ...prev,
            phone: `${e.target.value} ${phoneNumber}`
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Format address as a single string
            const addressString = [
                formData.address.street,
                formData.address.city,
                formData.address.state,
                formData.address.zipCode,
                formData.address.country
            ].filter(Boolean).join(', ');

            // Prepare data in the correct format for the backend
            const updateData = {
                phoneNumber: formData.phone, // Backend expects phoneNumber, not phone
                address: addressString || undefined // Send as string, not object
            };

            const response = await api.put(`/employees/${employee._id}`, updateData);
            onUpdate(response.data.data);
            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Edit Profile</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Phone size={18} /> Contact Information
                        </h3>
                        <div className={styles.formGroup}>
                            <label>Phone Number</label>
                            <div className={styles.phoneInputGroup}>
                                <select
                                    value={selectedCountryCode}
                                    onChange={handleCodeChange}
                                    className={styles.countrySelect}
                                >
                                    {countryCodes.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.country})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    placeholder="555 000-0000"
                                    className={styles.phoneInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <MapPin size={18} /> Address Details
                        </h3>
                        <div className={styles.formGroup}>
                            <label>Street Address</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                placeholder="123 Main St"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    placeholder="New York"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    placeholder="NY"
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    name="address.zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleChange}
                                    placeholder="10001"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    placeholder="USA"
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className={styles.saveButton}>
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
