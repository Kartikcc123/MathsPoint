const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
      user = await User.findOne({ email: normalizedEmail }).populate('course');
    } else {
      // allow login by studentId as well
      user = await User.findOne({ studentId: identifier }).populate('course');
    }

    if (user && (await user.matchPassword(password))) {
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        studentPanelAllowed: !!user.studentPanelAllowed,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new admin (initial setup only or specific route)
// @route   POST /api/auth/register-admin
// @access  Public (Should be secured in production)
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const setupKey = req.headers['x-admin-setup-key'];

    if (adminCount > 0 && (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY)) {
      return res.status(403).json({ message: 'Admin registration is restricted.' });
    }

    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { normalizedName: name?.trim().replace(/\s+/g, ' ').toLowerCase() },
      ],
    });

    if (userExists) {
      return res.status(400).json({ message: userExists.email === normalizedEmail ? 'This email is already registered.' : 'This admin name already exists.' });
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      // student has no course initially; admin can enroll later
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const user = await User.findById(req.user._id).populate('course');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      course: user.course,
      studentPanelAllowed: !!user.studentPanelAllowed,
    });
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  getUserProfile,
  loginUser,
  registerAdmin,
  registerStudent,
};
