const express = require('express');
const router = express.Router();
const { getStudentDashboard, getStudentAttendance, getStudentMaterials, getStudentPayments, payStudentFee, getStudentNotifications } = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, authorizeRoles('student'), getStudentDashboard);
router.route('/attendance').get(protect, authorizeRoles('student'), getStudentAttendance);
router.route('/materials').get(protect, authorizeRoles('student'), getStudentMaterials);
router.route('/payments').get(protect, authorizeRoles('student'), getStudentPayments);
router.route('/payments/:feeId/pay').post(protect, authorizeRoles('student'), payStudentFee);
router.route('/notifications').get(protect, authorizeRoles('student'), getStudentNotifications);

module.exports = router;
