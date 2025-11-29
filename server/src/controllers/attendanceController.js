const Attendance = require('../models/Attendance');

exports.checkIn = async (req, res) => {
    try {
        const { location } = req.body;
        const employeeId = req.user.employee ? req.user.employee._id : req.user._id;

        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (existing) {
            return res.status(400).json({ error: { message: 'Already checked in today' } });
        }

        const newAttendance = new Attendance({
            employee: employeeId,
            date: new Date(),
            checkIn: new Date(),
            location: location || 'Office',
            status: 'Present'
        });

        await newAttendance.save();
        res.status(201).json({ data: newAttendance });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const employeeId = req.user.employee ? req.user.employee._id : req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({ error: { message: 'No check-in record found for today' } });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ error: { message: 'Already checked out today' } });
        }

        attendance.checkOut = new Date();

        // Calculate total hours
        const diff = attendance.checkOut - attendance.checkIn;
        attendance.totalHours = diff / (1000 * 60 * 60); // hours

        await attendance.save();
        res.json({ data: attendance });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.getAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.find()
            .populate('employee', 'firstName lastName')
            .sort({ date: -1 })
            .limit(30);
        res.json({ data: history });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
