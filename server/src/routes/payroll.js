const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.get('/', payrollController.getAllPayrollRecords);
router.post('/', payrollController.createPayrollRecord);
router.get('/stats', payrollController.getPayrollStats);
router.delete('/:id', payrollController.deletePayrollRecord);

module.exports = router;
