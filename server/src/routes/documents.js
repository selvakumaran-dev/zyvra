const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.post('/', documentController.uploadDocument);
router.get('/:employeeId', documentController.getEmployeeDocuments);

module.exports = router;
