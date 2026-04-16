const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getStudents, getDashboardSummary, registerStudent, deleteStudent, createCourse, getCourses, assignStudentCourse, createMaterial, deleteMaterial, getMaterials, getPaymentRecords, getAttendanceRecord, saveAttendanceRecord, getNotifications, createNotification, updateNotification } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.route('/students')
  .get(protect, admin, getStudents);

router.route('/dashboard-summary')
  .get(protect, admin, getDashboardSummary);

router.route('/student')
  .post(protect, admin, registerStudent);

router.route('/student/:id')
  .delete(protect, admin, deleteStudent);

router.route('/student/:id/course')
  .patch(protect, admin, assignStudentCourse);

router.route('/student/:id/panel')
  .patch(protect, admin, require('../controllers/adminController').toggleStudentPanel);

router.route('/courses')
  .get(protect, admin, getCourses);

router.route('/course')
  .post(protect, admin, createCourse);

router.route('/materials')
  .get(protect, admin, getMaterials);

router.route('/payments')
  .get(protect, admin, getPaymentRecords);

router.route('/notifications')
  .get(protect, admin, getNotifications)
  .post(protect, admin, createNotification);

router.route('/notifications/:id')
  .patch(protect, admin, updateNotification);

router.route('/attendance/:courseId')
  .get(protect, admin, getAttendanceRecord)
  .post(protect, admin, saveAttendanceRecord);

router.route('/material')
  .post(protect, admin, upload.single('file'), createMaterial);

router.route('/material/:id')
  .delete(protect, admin, deleteMaterial);

// CSV results upload
router.route('/results/upload')
  .post(protect, admin, upload.single('file'), require('../controllers/adminController').uploadResults);

router.route('/results/create')
  .post(protect, admin, require('../controllers/adminController').createResultsFromRows);

router.route('/results/publish')
  .patch(protect, admin, require('../controllers/adminController').publishResults);

module.exports = router;
