const express = require('express');
const router = express.Router();
const { getParentChildren, getChildAttendance } = require('../controllers/parentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/children').get(protect, authorizeRoles('parent'), getParentChildren);
router.route('/children/:studentId/attendance').get(protect, authorizeRoles('parent'), getChildAttendance);

module.exports = router;
