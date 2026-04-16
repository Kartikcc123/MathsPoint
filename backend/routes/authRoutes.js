const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  loginUser,
  registerAdmin,
  registerStudent,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerStudent);
router.post('/register-admin', registerAdmin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
