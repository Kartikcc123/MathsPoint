const express = require('express');
const router = express.Router();
const {
  createLesson,
  updateLesson,
  deleteLesson,
  getAdminLessons,
  reorderLessons,
  getCourseLessons,
  getFreeLessons,
  getLessonPlayer,
  updateWatchProgress,
  getWatchProgress,
  testYouTubeEmbed,
} = require('../controllers/lessonController');
const { protect, admin, authorizeRoles } = require('../middleware/authMiddleware');
const { validateSession } = require('../controllers/sessionController');

const lessonManager = authorizeRoles('admin', 'teacher');

// ── Admin Routes ──
router.route('/admin/lesson')
  .post(protect, lessonManager, createLesson);

router.route('/admin/lesson/:id')
  .put(protect, lessonManager, updateLesson)
  .delete(protect, lessonManager, deleteLesson);

router.route('/admin/lessons/:courseId')
  .get(protect, lessonManager, getAdminLessons);

router.route('/admin/lessons/reorder')
  .patch(protect, lessonManager, reorderLessons);

// ── Test/Diagnostic Route ──
router.route('/test-youtube')
  .get(protect, admin, testYouTubeEmbed);

// ── Student Routes ──
router.route('/lesson/:id')
  .get(protect, authorizeRoles('student'), validateSession, getLessonPlayer);

router.route('/lesson/:id/progress')
  .post(protect, authorizeRoles('student'), updateWatchProgress);

router.route('/lessons/free')
  .get(protect, authorizeRoles('student'), getFreeLessons);

router.route('/lessons/course/:courseId')
  .get(protect, authorizeRoles('student'), getCourseLessons);

router.route('/lessons/progress/:courseId')
  .get(protect, authorizeRoles('student'), getWatchProgress);

module.exports = router;
