const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Mobile-optimized dashboard data
const getMobileDashboard = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        // Parallel fetch for speed
        const [attendance, leaves, profile] = await Promise.all([
            Attendance.findOne({
                employee: employeeId,
                date: new Date().setHours(0, 0, 0, 0)
            }),
            Leave.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(3),
            Employee.findById(employeeId).select('firstName lastName position department photo')
        ]);

        res.json({
            success: true,
            data: {
                profile,
                todayAttendance: attendance ? {
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    status: attendance.status
                } : null,
                recentLeaves: leaves,
                quickActions: [
                    { id: 'check-in', label: 'Check In', icon: 'map-pin' },
                    { id: 'apply-leave', label: 'Apply Leave', icon: 'calendar' },
                    { id: 'payslip', label: 'Payslip', icon: 'dollar-sign' }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch mobile dashboard' });
    }
};

// Geo-fenced Check-in
const mobileCheckIn = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const employeeId = req.user.employeeId;

        // Mock Office Coordinates (e.g., New York HQ)
        const OFFICE_LAT = 40.7128;
        const OFFICE_LNG = -74.0060;
        const MAX_DISTANCE_KM = 0.5; // 500 meters

        // Calculate distance (Haversine formula simplified)
        const R = 6371; // Radius of the earth in km
        const dLat = (latitude - OFFICE_LAT) * (Math.PI / 180);
        const dLon = (longitude - OFFICE_LNG) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(OFFICE_LAT * (Math.PI / 180)) * Math.cos(latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        const isWithinRange = distance <= MAX_DISTANCE_KM;

        // Record attendance
        const attendance = new Attendance({
            employee: employeeId,
            date: new Date().setHours(0, 0, 0, 0),
            checkIn: new Date(),
            status: 'Present',
            location: {
                latitude,
                longitude,
                isOffice: isWithinRange,
                address: isWithinRange ? 'Office HQ' : 'Remote'
            }
        });

        await attendance.save();

        res.json({
            success: true,
            data: {
                checkIn: attendance.checkIn,
                location: attendance.location,
                message: isWithinRange ? 'Checked in at Office' : 'Checked in Remotely'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Mobile check-in failed' });
    }
};

module.exports = {
    getMobileDashboard,
    mobileCheckIn
};
