const User = require('../models/User');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const CourseMaterial = require('../models/CourseMaterial');
const Notification = require('../models/Notification');
const { AppError, applyRevalidationHeaders, sendErrorResponse } = require('../utils/api');
const { normalizeAttendanceDateInput } = require('../utils/date');
const { serializeAttendanceForStudent } = require('../utils/attendance');

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId).select('-password').populate('course').populate('enrolledCourses');

    const fees = await Fee.find({ studentId }).sort({ dueDate: -1 });
    const results = await Result.find({ studentId }).sort({ date: -1 });
    const materials = student?.course
      ? await CourseMaterial.find({ course: student.course._id }).sort({ createdAt: -1 })
      : [];
    const attendanceSummary = student?.course
      ? await serializeAttendanceForStudent({ studentId, courseId: student.course._id })
      : { attendanceRecords: [], attendancePercentage: 0, latestUpdateAt: null };
    
    res.json({
      fees,
      results,
      materials,
      course: student?.course || null,
      enrolledCourses: student?.enrolledCourses || [],
      user: student,
      attendanceRecords: attendanceSummary.attendanceRecords,
      attendancePercentage: attendanceSummary.attendancePercentage,
      attendanceSyncedAt: attendanceSummary.latestUpdateAt,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load student dashboard.');
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select('_id role course linkedStudents').populate('course');
    if (!student?.course) {
      return res.json({
        attendanceRecords: [],
        attendancePercentage: 0,
        syncedAt: null,
      });
    }

    const from = req.query.from ? normalizeAttendanceDateInput(req.query.from) : null;
    const to = req.query.to ? normalizeAttendanceDateInput(req.query.to) : null;
    if ((req.query.from && !from) || (req.query.to && !to)) {
      throw new AppError(400, 'Invalid attendance range.', { code: 'ATTENDANCE_RANGE_INVALID' });
    }

    const attendanceSummary = await serializeAttendanceForStudent({
      studentId: student._id,
      courseId: student.course._id,
      from,
      to,
    });

    const versionToken = `student-attendance:${student._id}:${attendanceSummary.latestUpdateAt?.getTime?.() || 0}:${attendanceSummary.attendanceRecords.length}`;
    if (applyRevalidationHeaders(req, res, versionToken)) {
      return;
    }

    res.json({
      attendanceRecords: attendanceSummary.attendanceRecords,
      attendancePercentage: attendanceSummary.attendancePercentage,
      syncedAt: attendanceSummary.latestUpdateAt,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load attendance.');
  }
};

const getStudentMaterials = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select('course');

    if (!student?.course) {
      return res.json([]);
    }

    const materials = await CourseMaterial.find({ course: student.course })
      .populate('course', 'title duration')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load materials.');
  }
};

const getStudentMaterialById = async (req, res) => {
  try {
    const { materialId } = req.params;
    const student = await User.findById(req.user._id).select('course');

    if (!student?.course) {
      throw new AppError(403, 'You are not enrolled in any course.');
    }

    const material = await CourseMaterial.findById(materialId).populate('course', 'title');

    if (!material) {
      throw new AppError(404, 'Material not found.');
    }

    // Check if material belongs to student's course
    if (material.course._id.toString() !== student.course.toString()) {
      throw new AppError(403, 'You do not have access to this material.');
    }

    res.json(material);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load material.');
  }
};

const streamMaterialFile = async (req, res) => {
  try {
    const { materialId } = req.params;
    const student = await User.findById(req.user._id).select('course');

    if (!student?.course) {
      throw new AppError(403, 'You are not enrolled in any course.');
    }

    const material = await CourseMaterial.findById(materialId).populate('course', 'title');

    if (!material) {
      throw new AppError(404, 'Material not found.');
    }

    if (material.course._id.toString() !== student.course.toString()) {
      throw new AppError(403, 'You do not have access to this material.');
    }

    const fileUrl = material.fileUrl || '';

    // ── LOCAL FILE (uploaded via drag-and-drop) ──────────────────────────────
    if (fileUrl.startsWith('local:')) {
      const fs = require('fs');
      const path = require('path');
      const relativePath = fileUrl.replace('local:', '');
      const absPath = path.join(__dirname, '..', relativePath);

      if (!fs.existsSync(absPath)) {
        throw new AppError(404, 'File not found on server.');
      }

      const stat = fs.statSync(absPath);
      const ext = path.extname(absPath).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'private, max-age=3600');

      fs.createReadStream(absPath).pipe(res);
      return;
    }

    // ── LEGACY: GOOGLE DRIVE URL (fallback for old records) ──────────────────
    let fileId = null;
    try {
      const parsed = new URL(fileUrl);
      if (parsed.hostname.includes('drive.google.com')) {
        const match = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        fileId = match ? match[1] : parsed.searchParams.get('id');
      }
    } catch (_) {}

    if (!fileId) {
      throw new AppError(400, 'This material was stored as a Google Drive link. Please re-upload it as a file.');
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    const fetchOptions = {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/pdf,*/*' },
      redirect: 'follow',
    };

    let response = await fetch(downloadUrl, fetchOptions);
    const ct = response.headers.get('content-type') || '';

    if (ct.includes('text/html')) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
      if (confirmMatch) {
        const retryUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`;
        response = await fetch(retryUrl, fetchOptions);
      }
    }

    if (!response.ok) throw new AppError(502, 'Failed to fetch from Google Drive.');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);

  } catch (error) {
    sendErrorResponse(res, error, 'Failed to stream material.');
  }
};

const getStudentPayments = async (req, res) => {
  try {
    const payments = await Fee.find({ studentId: req.user._id }).sort({ dueDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load payments.');
  }
};

const payStudentFee = async (req, res) => {
  const { feeId } = req.params;
  const { method, reference, note } = req.body;

  try {
    const fee = await Fee.findOne({ _id: feeId, studentId: req.user._id });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found.' });
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ message: 'This fee has already been paid.' });
    }

    if (!['UPI', 'Net Banking'].includes(method)) {
      return res.status(400).json({ message: 'Please choose UPI or Net Banking.' });
    }

    const trimmedReference = reference?.trim();
    if (!trimmedReference) {
      return res.status(400).json({ message: 'Payment reference is required.' });
    }

    fee.status = 'Paid';
    fee.paidDate = new Date();
    fee.paymentMethod = method;
    fee.paymentReference = trimmedReference;
    fee.paymentNote = note?.trim() || undefined;

    await fee.save();
    res.json(fee);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to submit payment.');
  }
};

const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'All' },
        { target: 'Student', studentId: req.user._id },
      ],
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load notifications.');
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow updating specific fields
    const { name, phone, city, academicClass, board, exams, language } = req.body;

    if (name !== undefined) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (city !== undefined) student.city = city;
    if (academicClass !== undefined) student.academicClass = academicClass;
    if (board !== undefined) student.board = board;
    if (exams !== undefined) student.exams = exams;
    if (language !== undefined) student.language = language;

    await student.save();

    // Do not return password
    student.password = undefined;

    res.json(student);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update profile.');
  }
};

module.exports = { getStudentDashboard, getStudentAttendance, getStudentMaterials, getStudentMaterialById, streamMaterialFile, getStudentPayments, payStudentFee, getStudentNotifications, updateStudentProfile };
