const Payroll = require('../models/Payroll');

exports.getAllPayrollRecords = async (req, res) => {
    try {
        const records = await Payroll.find().populate('employee', 'firstName lastName designation');
        res.json({ data: records });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createPayrollRecord = async (req, res) => {
    try {
        // Simple calculation logic (can be expanded)
        const { basicSalary, allowances, deductions } = req.body;

        const totalAllowances = Object.values(allowances || {}).reduce((a, b) => a + b, 0);
        const totalDeductions = Object.values(deductions || {}).reduce((a, b) => a + b, 0);
        const netPay = basicSalary + totalAllowances - totalDeductions;

        const newPayroll = new Payroll({
            ...req.body,
            netPay
        });

        const savedPayroll = await newPayroll.save();
        res.status(201).json({ data: savedPayroll });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.getPayrollStats = async (req, res) => {
    try {
        const stats = await Payroll.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayroll: { $sum: "$netPay" },
                    avgSalary: { $avg: "$netPay" },
                    employeeCount: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalPayroll: 0, avgSalary: 0, employeeCount: 0 };

        res.json({
            data: {
                totalPayroll: result.totalPayroll,
                avgSalary: Math.round(result.avgSalary),
                employeeCount: result.employeeCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
exports.deletePayrollRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRecord = await Payroll.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res.status(404).json({ error: { message: 'Payroll record not found' } });
        }
        res.json({ message: 'Payroll record deleted successfully', data: deletedRecord });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
