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
  checkPhoneExists,
  checkEmailExists,
  registerAppStudent,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateAvatar,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', loginUser);
router.post('/verify-login-2fa', verifyLogin2FA);
router.post('/setup-2fa', protect, setup2FA);
router.post('/verify-setup-2fa', protect, verifySetup2FA);
router.post('/register', registerStudent);
router.post('/register-admin', registerAdmin);
router.post('/check-phone', checkPhoneExists);
router.post('/check-email', checkEmailExists);
router.post('/register-app', registerAppStudent);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
