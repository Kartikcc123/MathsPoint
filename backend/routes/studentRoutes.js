const express = require('express');
const router = express.Router();
const { getStudentDashboard, getStudentMaterials, getStudentPayments, payStudentFee, getStudentNotifications } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getStudentDashboard);
router.route('/materials').get(protect, getStudentMaterials);
router.route('/payments').get(protect, getStudentPayments);
router.route('/payments/:feeId/pay').post(protect, payStudentFee);
router.route('/notifications').get(protect, getStudentNotifications);

module.exports = router;
