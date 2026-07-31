const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { sendErrorResponse } = require('../utils/api');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const normalizePhone = (value = '') => value.replace(/\D/g, '');

const getUiRole = (user) => {
  if (user.role === 'teacher') {
    return 'admin';
  }

  return user.role;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const identifier = (email || '').trim();

  try {
    let user;
    if (identifier.includes('@')) {
      const normalizedEmail = identifier.toLowerCase();
      user = await User.findOne({ email: normalizedEmail }).populate('course').populate('enrolledCourses');
    } else {
      // allow login by studentId or phone as well
      user = await User.findOne({ 
        $or: [
          { studentId: identifier },
          { normalizedPhone: normalizePhone(identifier) }
        ]
      }).populate('course').populate('enrolledCourses');
    }

    if (user && (await user.matchPassword(password))) {
      // 2FA INTERCEPTION
      if (user.twoFactorEnabled) {
        return res.json({ 
          require2FA: true, 
          userId: user._id,
          role: getUiRole(user),
          actualRole: user.role
        });
      }

      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: getUiRole(user),
        actualRole: user.role,
        studentId: user.studentId,
        course: user.course,
        studentPanelAllowed: !!user.studentPanelAllowed,
        enrolledCourses: user.enrolledCourses || [],
        linkedStudents: user.linkedStudents || [],
        taughtCourses: user.taughtCourses || [],
        phone: user.phone,
        city: user.city,
        academicClass: user.academicClass,
        board: user.board,
        exams: user.exams,
        language: user.language,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password', code: 'AUTH_INVALID_CREDENTIALS' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Login failed.');
  }
};

// @desc    Verify 2FA during Login
// @route   POST /api/auth/verify-login-2fa
// @access  Public (technically half-authenticated)
const verifyLogin2FA = async (req, res) => {
  const { userId, code } = req.body;

  try {
    const normalizedUserId = String(userId || '').trim();
    const normalizedCode = String(code || '').replace(/\D/g, '');

    if (!normalizedUserId || normalizedCode.length !== 6) {
      return res.status(400).json({ message: 'A valid 6-digit authenticator code is required.' });
    }

    const user = await User.findById(normalizedUserId).populate('course').populate('enrolledCourses');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA verification failed or not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: normalizedCode,
      window: 2 // Allow up to 60 seconds clock drift
    });

    if (verified) {
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: getUiRole(user),
        actualRole: user.role,
        studentId: user.studentId,
        course: user.course,
        studentPanelAllowed: !!user.studentPanelAllowed,
        enrolledCourses: user.enrolledCourses || [],
        linkedStudents: user.linkedStudents || [],
        taughtCourses: user.taughtCourses || [],
        phone: user.phone,
        city: user.city,
        academicClass: user.academicClass,
        board: user.board,
        exams: user.exams,
        language: user.language,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid Authenticator Code' });
    }
  } catch (error) {
    sendErrorResponse(res, error, '2FA Login failed.');
  }
};

// @desc    Setup 2FA (Generates Secret and QR Code)
// @route   POST /api/auth/setup-2fa
// @access  Private
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `MathsPoint (${user.email})`
    });

    // Save secret temporarily to user (will be enabled upon verification)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR Code URL
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR Code' });
      }
      res.json({ secret: secret.base32, qrCodeUrl: data_url });
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to setup 2FA.');
  }
};

// @desc    Verify and Enable 2FA Setup
// @route   POST /api/auth/verify-setup-2fa
// @access  Private
const verifySetup2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA Successfully Enabled' });
    } else {
      res.status(400).json({ message: 'Invalid Code. 2FA not enabled.' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to verify 2FA setup.');
  }
};

// @desc    Check if a user exists by phone number
// @route   POST /api/auth/check-phone
// @access  Public
const checkPhoneExists = async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { normalizedPhone: normalizedPhone },
        { phone: phone },
        { phone: normalizedPhone },
        { studentId: phone }
      ]
    });
    
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to check phone.');
  }
};

// @desc    Check if a user exists by email address
// @route   POST /api/auth/check-email
// @access  Public
const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to check email.');
  }
};

// @desc    Register a new admin
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const setupKey = req.headers['x-admin-setup-key'];

    if (adminCount > 0 && (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY)) {
      return res.status(403).json({ message: 'Admin registration is restricted.', code: 'ADMIN_REGISTRATION_RESTRICTED' });
    }

    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { normalizedName: name?.trim().replace(/\s+/g, ' ').toLowerCase() },
      ],
    });

    if (userExists) {
      return res.status(400).json({ message: userExists.email === normalizedEmail ? 'This email is already registered.' : 'This admin name already exists.', code: 'ADMIN_ALREADY_EXISTS' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'admin'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data', code: 'ADMIN_INVALID_DATA' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Admin registration failed.');
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  const { name, email, password, phone, parentName, parentEmail, parentPhone } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();
  const normalizedParentEmail = parentEmail?.trim().toLowerCase();
  const normalizedParentPhone = parentPhone?.trim();
  const normalizedParentName = parentName?.trim();

  try {
    if (!normalizedPhone || !normalizedParentName || !normalizedParentEmail || !normalizedParentPhone) {
      return res.status(400).json({
        message: 'Student phone, parent name, parent email, and parent phone are required.',
        code: 'STUDENT_PARENT_DETAILS_REQUIRED',
      });
    }

    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { normalizedPhone: normalizePhone(normalizedPhone) },
      ],
    });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === normalizedEmail ? 'This email is already registered.' : 'This mobile number is already registered.',
        code: 'STUDENT_ALREADY_EXISTS',
      });
    }

    let parentUser = await User.findOne({
      role: 'parent',
      $or: [
        { email: normalizedParentEmail },
        { normalizedPhone: normalizePhone(normalizedParentPhone) },
      ],
    });

    if (!parentUser) {
      const conflictingParentIdentity = await User.findOne({
        $or: [
          { email: normalizedParentEmail },
          { normalizedPhone: normalizePhone(normalizedParentPhone) },
        ],
      });

      if (conflictingParentIdentity) {
        return res.status(400).json({
          message: 'Parent email or phone is already being used by another account.',
          code: 'PARENT_IDENTITY_CONFLICT',
        });
      }
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      phone: normalizedPhone,
      parentName: normalizedParentName,
      parentEmail: normalizedParentEmail,
      parentPhone: normalizedParentPhone,
    });

    if (!parentUser) {
      parentUser = await User.create({
        name: normalizedParentName,
        email: normalizedParentEmail,
        password: normalizedParentPhone,
        role: 'parent',
        phone: normalizedParentPhone,
        linkedStudents: [user._id],
      });
    } else if (!parentUser.linkedStudents.some((studentId) => String(studentId) === String(user._id))) {
      parentUser.linkedStudents = [...parentUser.linkedStudents, user._id];
      await parentUser.save();
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        actualRole: user.role,
        phone: user.phone,
        enrolledCourses: user.enrolledCourses || [],
        parentEmail: user.parentEmail,
        parentPhone: user.parentPhone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data', code: 'STUDENT_INVALID_DATA' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Student registration failed.');
  }
};

// @desc    Register a new student from the mobile app (no parent details)
// @route   POST /api/auth/register-app
// @access  Public
const registerAppStudent = async (req, res) => {
  const { name, email, phone, state, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  try {
    if (!normalizedPhone || !name || !password) {
      return res.status(400).json({
        message: 'Name, phone, and password are required.',
        code: 'STUDENT_DETAILS_REQUIRED',
      });
    }

    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { normalizedPhone: normalizedPhone },
        { phone: phone },
        { phone: normalizedPhone },
        { studentId: phone }
      ],
    });

    if (userExists) {
      let isEmailMatch = false;
      if (userExists.email && userExists.email.toLowerCase() === normalizedEmail) {
        isEmailMatch = true;
      }
      return res.status(400).json({
        message: isEmailMatch ? 'This email is already registered.' : 'This mobile number is already registered.',
        code: 'STUDENT_ALREADY_EXISTS',
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      phone: normalizedPhone,
      city: state, // storing state in city field if state doesn't exist, wait, the schema might not have state. Let's just use city for state or add state.
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        actualRole: user.role,
        phone: user.phone,
        enrolledCourses: user.enrolledCourses || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data', code: 'STUDENT_INVALID_DATA' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Mobile app registration failed.');
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('course')
    .populate('enrolledCourses')
    .populate('linkedStudents', 'name email studentId course')
    .populate('taughtCourses', 'title duration');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: getUiRole(user),
      actualRole: user.role,
      studentId: user.studentId,
      course: user.course,
      studentPanelAllowed: !!user.studentPanelAllowed,
      enrolledCourses: user.enrolledCourses || [],
      linkedStudents: user.linkedStudents || [],
      taughtCourses: user.taughtCourses || [],
      phone: user.phone,
      city: user.city,
      academicClass: user.academicClass,
      board: user.board,
      exams: user.exams,
      language: user.language,
      avatar: user.avatar,
    });
  } else {
    return res.status(404).json({ message: 'User not found', code: 'AUTH_PROFILE_NOT_FOUND' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Don't leak if the user exists or not for security, just say email sent.
      return res.status(200).json({ success: true, message: 'Email sent' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset url
    // When you deploy your app to the internet, you will set FRONTEND_URL in your server's .env file (e.g. FRONTEND_URL=https://mathspoint.com)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Forgot password failed');
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password - the Mongoose pre('save') hook will hash it automatically!
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    sendErrorResponse(res, error, 'Reset password failed');
  }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.username !== undefined) user.username = req.body.username;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        username: updatedUser.username,
        bio: updatedUser.bio,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update profile');
  }
};

module.exports = {
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
};
