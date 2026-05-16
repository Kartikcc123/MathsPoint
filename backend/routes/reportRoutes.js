const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

// All report routes are admin-only for security
router.post('/send-individual/:studentId', protect, admin, reportController.sendIndividualReport);
router.post('/send-batch/:courseId', protect, admin, reportController.sendBatchReport);

module.exports = router;
