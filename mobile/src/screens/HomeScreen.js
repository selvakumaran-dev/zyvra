import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import * as Location from 'expo-location'; // In real app

export default function HomeScreen() {
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('Present');

    const handleCheckIn = async () => {
        // Mock Geo-fencing check
        Alert.alert('Checking Location...', 'Verifying proximity to office...');

        setTimeout(() => {
            Alert.alert('Success', 'Checked in at Office HQ (Mock)');
            setStatus('Present');
        }, 1500);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.name}>Alex Johnson</Text>
                <Text style={styles.role}>Senior Developer</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Today's Attendance</Text>
                <View style={styles.attendanceRow}>
                    <View>
                        <Text style={styles.label}>Check In</Text>
                        <Text style={styles.time}>09:00 AM</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>Check Out</Text>
                        <Text style={styles.time}>--:--</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>Status</Text>
                        <Text style={[styles.status, { color: '#10b981' }]}>{status}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
                    <Text style={styles.checkInText}>Geo-Check In</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem}>
                    <Text style={styles.gridIcon}>📅</Text>
                    <Text style={styles.gridLabel}>Apply Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}>
                    <Text style={styles.gridIcon}>💰</Text>
                    <Text style={styles.gridLabel}>Payslips</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}>
                    <Text style={styles.gridIcon}>👥</Text>
                    <Text style={styles.gridLabel}>Directory</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}>
                    <Text style={styles.gridIcon}>🔔</Text>
                    <Text style={styles.gridLabel}>Approvals</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        paddingTop: 20,
        paddingBottom: 30,
    },
    greeting: {
        fontSize: 16,
        color: '#64748b',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    role: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
    },
    card: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: -20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#1e293b',
    },
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    time: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    status: {
        fontSize: 16,
        fontWeight: '600',
    },
    checkInButton: {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkInText: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 20,
        marginBottom: 15,
        color: '#1e293b',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    gridItem: {
        width: '45%',
        backgroundColor: '#fff',
        margin: '2.5%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    gridIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
});
