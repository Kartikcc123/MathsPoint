const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getStudents, getInquiries, updateInquiryStatus, getDashboardSummary, registerStudent, createManagedUser, linkParentStudents, assignTeacherCourses, deleteStudent, createCourse, deleteCourse, getCourses, assignStudentCourse, createMaterial, deleteMaterial, getMaterials, createFreeStudyMaterial, getFreeStudyMaterials, deleteFreeStudyMaterial, getPaymentRecords, getAttendanceRecord, getAttendanceSummary, getAttendanceTrends, saveAttendanceRecord, getNotifications, createNotification, updateNotification } = require('../controllers/adminController');
const { protect, admin, attendanceManager } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'materials');
    const fs = require('fs');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, images, and Word documents are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

const freeMaterialStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'free-materials');
    const fs = require('fs');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const freeMaterialUpload = multer({
  storage: freeMaterialStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.route('/students')
  .get(protect, attendanceManager, getStudents);

router.route('/inquiries')
  .get(protect, admin, getInquiries);

router.route('/dashboard-summary')
  .get(protect, admin, getDashboardSummary);

router.route('/student')
  .post(protect, admin, registerStudent);

router.route('/user')
  .post(protect, admin, createManagedUser);

router.route('/student/:id')
  .delete(protect, admin, deleteStudent);

router.route('/inquiry/:id')
  .patch(protect, admin, updateInquiryStatus);

router.route('/student/:id/course')
  .patch(protect, admin, assignStudentCourse);

router.route('/student/:id/panel')
  .patch(protect, admin, require('../controllers/adminController').toggleStudentPanel);

router.route('/parent/:id/students')
  .patch(protect, admin, linkParentStudents);

router.route('/teacher/:id/courses')
  .patch(protect, admin, assignTeacherCourses);

router.route('/courses')
  .get(protect, attendanceManager, getCourses);

router.route('/course')
  .post(protect, admin, createCourse);

router.route('/course/:id')
  .delete(protect, admin, deleteCourse)
  .put(protect, admin, require('../controllers/adminController').updateCourse);

router.route('/course/:id/delete-subject')
  .patch(protect, admin, require('../controllers/adminController').deleteSubject);

router.route('/course/:id/delete-chapter')
  .patch(protect, admin, require('../controllers/adminController').deleteChapter);

router.route('/materials')
  .get(protect, admin, getMaterials);

router.route('/free-materials')
  .get(protect, admin, getFreeStudyMaterials)
  .post(protect, admin, freeMaterialUpload.single('file'), createFreeStudyMaterial);

router.route('/payments')
  .get(protect, admin, getPaymentRecords);

router.route('/notifications')
  .get(protect, admin, getNotifications)
  .post(protect, admin, createNotification);

router.route('/notifications/:id')
  .patch(protect, admin, updateNotification);

router.route('/attendance/summary')
  .get(protect, attendanceManager, getAttendanceSummary);

router.route('/attendance/trends')
  .get(protect, attendanceManager, getAttendanceTrends);

router.route('/attendance/:courseId')
  .get(protect, attendanceManager, getAttendanceRecord)
  .post(protect, attendanceManager, saveAttendanceRecord);

router.route('/material')
  .post(protect, admin, upload.single('file'), createMaterial);

router.route('/material/:id')
  .delete(protect, admin, deleteMaterial);

router.route('/free-materials/:id')
  .delete(protect, admin, deleteFreeStudyMaterial);

// CSV results upload
router.route('/results/upload')
  .post(protect, admin, upload.single('file'), require('../controllers/adminController').uploadResults);

router.route('/results/create')
  .post(protect, admin, require('../controllers/adminController').createResultsFromRows);

router.route('/results/publish')
  .patch(protect, admin, require('../controllers/adminController').publishResults);

module.exports = router;
