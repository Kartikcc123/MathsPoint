const express = require('express');
const router = express.Router();
const {
  registerDevice,
  getActiveSessions,
  terminateSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/register')
  .post(protect, registerDevice);

router.route('/active')
  .get(protect, getActiveSessions);

router.route('/:sessionId')
  .delete(protect, terminateSession);

module.exports = router;
