const User = require('../models/User');
const Course = require('../models/Course');
const CourseMaterial = require('../models/CourseMaterial');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Result = require('../models/Result');

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ').toLowerCase();
const normalizePhone = (value = '') => value.replace(/\D/g, '');

const getDuplicateStudentMessage = async ({ email, phone, name, studentId }, excludeUserId = null) => {
  const filters = [];

  if (email?.trim()) {
    filters.push({ email: email.trim().toLowerCase() });
  }

  if (phone?.trim()) {
    filters.push({ normalizedPhone: normalizePhone(phone) });
  }

  if (name?.trim()) {
    filters.push({ normalizedName: normalizeName(name) });
  }

  if (studentId?.trim()) {
    filters.push({ studentId: studentId.trim() });
  }

  if (!filters.length) {
    return null;
  }

  const duplicate = await User.findOne({
    ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    $or: filters,
  });

  if (!duplicate) {
    return null;
  }

  if (email?.trim() && duplicate.email === email.trim().toLowerCase()) {
    return 'This email is already registered.';
  }

  if (phone?.trim() && duplicate.normalizedPhone === normalizePhone(phone)) {
    return 'This mobile number is already registered.';
  }

  if (name?.trim() && duplicate.normalizedName === normalizeName(name)) {
    return 'This student name already exists.';
  }

  if (studentId?.trim() && duplicate.studentId === studentId.trim()) {
    return 'This student ID is already registered.';
  }

  return 'Duplicate student record detected.';
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('course');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard summary
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
const getDashboardSummary = async (_req, res) => {
  try {
    const [students, courses, materials, payments, notifications, attendanceRecords, unpublishedResults] = await Promise.all([
      User.find({ role: 'student' }).populate('course').sort({ createdAt: -1 }),
      Course.find({}).sort({ createdAt: -1 }),
      CourseMaterial.find({}).sort({ createdAt: -1 }),
      Fee.find({})
        .populate('studentId', 'name email studentId course')
        .populate({
          path: 'studentId',
          populate: { path: 'course', select: 'title' },
        })
        .sort({ dueDate: -1, createdAt: -1 }),
      Notification.find({}).sort({ updatedAt: -1, createdAt: -1 }),
      Attendance.find({}).sort({ date: -1 }),
      Result.countDocuments({ published: false }),
    ]);

    const totalRevenue = payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const pendingPayments = payments.filter((payment) => payment.status !== 'Paid').length;
    const studentsWithAccess = students.filter((student) => student.course || student.studentPanelAllowed).length;

    let attendanceEntries = 0;
    let attendancePresent = 0;

    attendanceRecords.forEach((record) => {
      (record.records || []).forEach((entry) => {
        attendanceEntries += 1;
        if (entry.status === 'Present' || entry.status === 'Late') {
          attendancePresent += 1;
        }
      });
    });

    const averageAttendance = attendanceEntries
      ? Math.round((attendancePresent / attendanceEntries) * 100)
      : 0;

    const revenueByMonth = payments
      .filter((payment) => payment.status === 'Paid' && payment.paidDate)
      .reduce((accumulator, payment) => {
        const monthKey = new Date(payment.paidDate).toLocaleString('en-IN', {
          month: 'short',
          year: 'numeric',
        });

        accumulator[monthKey] = (accumulator[monthKey] || 0) + Number(payment.amount || 0);
        return accumulator;
      }, {});

    const revenueSeries = Object.entries(revenueByMonth)
      .map(([name, revenue]) => ({ name, revenue }))
      .slice(-6);

    const recentStudents = students.slice(0, 5).map((student) => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      courseTitle: student.course?.title || '',
      studentPanelAllowed: !!student.studentPanelAllowed,
      createdAt: student.createdAt,
    }));

    res.json({
      totals: {
        students: students.length,
        courses: courses.length,
        materials: materials.length,
        notifications: notifications.length,
        payments: payments.length,
        totalRevenue,
        pendingPayments,
        averageAttendance,
        studentsWithAccess,
        unpublishedResults,
      },
      revenueSeries,
      recentStudents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a student and related records
// @route   DELETE /api/admin/student/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findOne({ _id: id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await Promise.all([
      Fee.deleteMany({ studentId: student._id }),
      Notification.deleteMany({ studentId: student._id }),
      Result.deleteMany({ studentId: student._id }),
      Attendance.updateMany(
        { 'records.studentId': student._id },
        { $pull: { records: { studentId: student._id } } }
      ),
    ]);

    await student.deleteOne();

    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/admin/student
// @access  Private/Admin
const registerStudent = async (req, res) => {
  const { name, email, password, studentId, parentEmail, parentPhone, phone, address } = req.body;

  try {
    const duplicateMessage = await getDuplicateStudentMessage({ name, email, phone, studentId });
    if (duplicateMessage) {
      return res.status(400).json({ message: duplicateMessage });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId,
      course: null,
      parentEmail,
      parentPhone,
      phone,
      address,
    });

    const populatedUser = await user.populate('course');
    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/admin/course
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { title, description, subjects, feeAmount, duration } = req.body;

  try {
    const course = await Course.create({
      title, description, subjects, feeAmount, duration
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign course access to a student
// @route   PATCH /api/admin/student/:id/course
// @access  Private/Admin
const assignStudentCourse = async (req, res) => {
  const { id } = req.params;
  const { courseId } = req.body;

  try {
    const student = await User.findOne({ _id: id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!courseId) {
      student.course = null;
      await student.save();
      const updatedStudent = await student.populate('course');
      return res.json(updatedStudent);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    student.course = course._id;
    await student.save();

    const updatedStudent = await student.populate('course');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle student panel access flag for a student
// @route   PATCH /api/admin/student/:id/panel
// @access  Private/Admin
const toggleStudentPanel = async (req, res) => {
  const { id } = req.params;
  const { allow } = req.body;

  try {
    const student = await User.findOne({ _id: id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.studentPanelAllowed = !!allow;
    await student.save();

    const updatedStudent = await student.populate('course');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMaterial = async (req, res) => {
  const { course, title, description, type, moduleName, fileUrl } = req.body;

  try {
    const normalizedType = type || 'Notes';
    const uploadedFileUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : '';
    const resolvedFileUrl = uploadedFileUrl || fileUrl;

    if (!resolvedFileUrl) {
      return res.status(400).json({ message: 'Please provide a file upload or direct link.' });
    }

    const material = await CourseMaterial.create({
      course,
      title,
      description,
      type: normalizedType,
      moduleName,
      fileUrl: resolvedFileUrl,
      publishedBy: req.user._id,
    });

    const populated = await material.populate('course', 'title duration');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a material
// @route   DELETE /api/admin/material/:id
// @access  Private/Admin
const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await CourseMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await material.deleteOne();

    res.json({ message: 'Material deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaterials = async (req, res) => {
  try {
    const materials = await CourseMaterial.find({})
      .populate('course', 'title duration')
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentRecords = async (req, res) => {
  try {
    const payments = await Fee.find({})
      .populate('studentId', 'name email studentId course')
      .populate({
        path: 'studentId',
        populate: { path: 'course', select: 'title' },
      })
      .sort({ dueDate: -1, createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceRecord = async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Attendance date is required.' });
    }

    const startOfDay = new Date(date);
    if (Number.isNaN(startOfDay.getTime())) {
      return res.status(400).json({ message: 'Invalid attendance date.' });
    }

    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const attendance = await Attendance.findOne({
      course: courseId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveAttendanceRecord = async (req, res) => {
  const { courseId } = req.params;
  const { date, records } = req.body;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Attendance date is required.' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const startOfDay = new Date(date);
    if (Number.isNaN(startOfDay.getTime())) {
      return res.status(400).json({ message: 'Invalid attendance date.' });
    }

    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const normalizedRecords = records.map((record) => ({
      studentId: record.studentId,
      status: record.status,
    }));

    const attendance = await Attendance.findOneAndUpdate(
      {
        course: courseId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
      {
        course: courseId,
        date: startOfDay,
        records: normalizedRecords,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('studentId', 'name email studentId')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  const { title, message, target, studentId } = req.body;

  try {
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    if (target === 'Student' && !studentId) {
      return res.status(400).json({ message: 'Please choose a student for student-targeted notifications.' });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      target: target || 'All',
      studentId: target === 'Student' ? studentId : undefined,
      isRead: false,
    });

    const populated = await notification.populate('studentId', 'name email studentId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { title, message, target, studentId } = req.body;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    if (target === 'Student' && !studentId) {
      return res.status(400).json({ message: 'Please choose a student for student-targeted notifications.' });
    }

    notification.title = title.trim();
    notification.message = message.trim();
    notification.target = target || 'All';
    notification.studentId = target === 'Student' ? studentId : undefined;

    await notification.save();

    const populated = await notification.populate('studentId', 'name email studentId');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload CSV of results and create Result documents
// @route   POST /api/admin/results/upload
// @access  Private/Admin
const uploadResults = async (req, res) => {
  try {
    // Support preview mode (no DB writes) and create-from-rows mode (rows JSON)
    const mode = String(req.query.mode || 'preview');
    const fs = require('fs');
    let csvData = '';

    if (req.file) {
      const filePath = req.file.path;
      csvData = fs.readFileSync(filePath, 'utf8');
    } else if (req.body.csvString) {
      csvData = req.body.csvString;
    } else if (mode === 'preview') {
      return res.status(400).json({ message: 'Please upload a CSV file for preview.' });
    }

    const lines = csvData.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV file appears empty or invalid.' });
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idx = {};
    header.forEach((h, i) => { idx[h] = i; });

    const User = require('../models/User');
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length === 0) continue;

      const studentIdValue = (cols[idx['studentid']] || cols[0] || '').trim();
      const examName = cols[idx['examname']] || cols[1] || 'Exam';
      const dateVal = cols[idx['date']] || new Date().toISOString();
      const marksObtained = Number(cols[idx['marksobtained']] || cols[3] || 0);
      const totalMarks = Number(cols[idx['totalmarks']] || cols[4] || 100);
      const subject = cols[idx['subject']] || cols[5] || 'General';
      const remarks = cols[idx['remarks']] || cols[6] || '';

      const student = studentIdValue ? await User.findOne({ studentId: studentIdValue }) : null;

      parsedRows.push({
        studentIdValue,
        studentDbId: student?._id || null,
        studentName: student?.name || null,
        examName,
        date: new Date(dateVal),
        marksObtained,
        totalMarks,
        subject,
        remarks,
      });
    }

    if (mode === 'preview') {
      return res.json({ parsedRows, count: parsedRows.length });
    }

    // If mode === 'create' and rows provided in body (JSON) create results as drafts
    if (mode === 'create') {
      const Result = require('../models/Result');
      const rows = req.body.rows || parsedRows;
      const created = [];

      for (const r of rows) {
        if (!r.studentDbId) continue; // skip rows without matched student
        const doc = await Result.create({
          studentId: r.studentDbId,
          examName: r.examName,
          date: r.date || new Date(),
          marksObtained: Number(r.marksObtained || 0),
          totalMarks: Number(r.totalMarks || 100),
          subject: r.subject || 'General',
          remarks: r.remarks || '',
          published: false,
        });
        created.push(doc);
      }

      return res.json({ message: `Created ${created.length} draft results.`, createdCount: created.length, createdIds: created.map(c => c._id) });
    }

    return res.status(400).json({ message: 'Invalid mode for results upload.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create results from provided rows (JSON) as drafts
// @route   POST /api/admin/results/create
// @access  Private/Admin
const createResultsFromRows = async (req, res) => {
  try {
    const rows = req.body.rows || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No rows provided.' });
    }

    const Result = require('../models/Result');
    const created = [];
    for (const r of rows) {
      if (!r.studentDbId) continue;
      const doc = await Result.create({
        studentId: r.studentDbId,
        examName: r.examName,
        date: r.date || new Date(),
        marksObtained: Number(r.marksObtained || 0),
        totalMarks: Number(r.totalMarks || 100),
        subject: r.subject || 'General',
        remarks: r.remarks || '',
        published: false,
      });
      created.push(doc);
    }

    res.json({ message: `Created ${created.length} draft results.`, createdCount: created.length, createdIds: created.map(c => c._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish existing result documents by ids
// @route   PATCH /api/admin/results/publish
// @access  Private/Admin
const publishResults = async (req, res) => {
  try {
    const ids = req.body.ids || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No result ids provided to publish.' });
    }

    const Result = require('../models/Result');
    const updated = await Result.updateMany({ _id: { $in: ids } }, { $set: { published: true } });
    res.json({ message: `Published ${updated.modifiedCount || updated.nModified || 0} results.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, getDashboardSummary, registerStudent, deleteStudent, createCourse, getCourses, assignStudentCourse, createMaterial, deleteMaterial, getMaterials, getPaymentRecords, getAttendanceRecord, saveAttendanceRecord, getNotifications, createNotification, updateNotification, toggleStudentPanel, uploadResults, createResultsFromRows, publishResults };
