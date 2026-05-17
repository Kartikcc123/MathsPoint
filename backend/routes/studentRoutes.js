const express = require('express');
const router = express.Router();
const { getStudentDashboard, getStudentAttendance, getStudentMaterials, getStudentMaterialById, streamMaterialFile, getStudentPayments, payStudentFee, getStudentNotifications, updateStudentProfile } = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, authorizeRoles('student'), getStudentDashboard);
router.route('/profile').put(protect, authorizeRoles('student'), updateStudentProfile);
router.route('/attendance').get(protect, authorizeRoles('student'), getStudentAttendance);
router.route('/materials').get(protect, authorizeRoles('student'), getStudentMaterials);
router.route('/material/:materialId').get(protect, authorizeRoles('student'), getStudentMaterialById);
router.route('/material/:materialId/stream').get(protect, authorizeRoles('student'), streamMaterialFile);
router.route('/payments').get(protect, authorizeRoles('student'), getStudentPayments);
router.route('/payments/:feeId/pay').post(protect, authorizeRoles('student'), payStudentFee);
router.route('/notifications').get(protect, authorizeRoles('student'), getStudentNotifications);

// Test series endpoint - returns results formatted as test entries
router.route('/test-series').get(protect, authorizeRoles('student'), async (req, res) => {
  try {
    const Result = require('../models/Result');
    const results = await Result.find({ student: req.user._id }).sort({ date: -1 });
    // Map results to test-series format
    const tests = results.map(r => ({
      _id: r._id,
      title: r.examName,
      examName: r.examName,
      subject: r.subject,
      date: r.date,
      totalMarks: r.totalMarks,
      marksObtained: r.marksObtained,
      completed: true,
      remarks: r.remarks,
      reportCardUrl: r.reportCardUrl,
    }));
    res.json(tests);
  } catch (err) {
    console.error('Test series error:', err);
    res.status(500).json({ message: 'Failed to load test series' });
  }
});

module.exports = router;
