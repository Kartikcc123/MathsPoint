const express = require('express');
const router = express.Router();
const {
  createLesson,
  updateLesson,
  deleteLesson,
  getAdminLessons,
  reorderLessons,
  getCourseLessons,
  getLessonPlayer,
  updateWatchProgress,
  getWatchProgress,
  testYouTubeEmbed,
} = require('../controllers/lessonController');
const { protect, admin, authorizeRoles } = require('../middleware/authMiddleware');
const { validateSession } = require('../controllers/sessionController');

// ── Admin Routes ──
router.route('/admin/lesson')
  .post(protect, admin, createLesson);

router.route('/admin/lesson/:id')
  .put(protect, admin, updateLesson)
  .delete(protect, admin, deleteLesson);

router.route('/admin/lessons/:courseId')
  .get(protect, admin, getAdminLessons);

router.route('/admin/lessons/reorder')
  .patch(protect, admin, reorderLessons);

// ── Test/Diagnostic Route ──
router.route('/test-youtube')
  .get(protect, admin, testYouTubeEmbed);

// ── Student Routes ──
router.route('/lesson/:id')
  .get(protect, authorizeRoles('student'), validateSession, getLessonPlayer);

router.route('/lesson/:id/progress')
  .post(protect, authorizeRoles('student'), updateWatchProgress);

router.route('/lessons/course/:courseId')
  .get(protect, authorizeRoles('student'), getCourseLessons);

router.route('/lessons/progress/:courseId')
  .get(protect, authorizeRoles('student'), getWatchProgress);

module.exports = router;
