const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  loginUser,
  verifyLogin2FA,
  setup2FA,
  verifySetup2FA,
  registerAdmin,
  registerStudent,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/verify-login-2fa', verifyLogin2FA);
router.post('/setup-2fa', protect, setup2FA);
router.post('/verify-setup-2fa', protect, verifySetup2FA);
router.post('/register', registerStudent);
router.post('/register-admin', registerAdmin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
