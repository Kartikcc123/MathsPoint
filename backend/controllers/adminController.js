const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseMaterial = require('../models/CourseMaterial');
const Lesson = require('../models/Lesson');
const Order = require('../models/Order');
const WatchProgress = require('../models/WatchProgress');
const FreeStudyMaterial = require('../models/FreeStudyMaterial');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Result = require('../models/Result');
const Inquiry = require('../models/Inquiry');
const { AppError, applyRevalidationHeaders, createRequestFingerprint, sendErrorResponse } = require('../utils/api');
const { attendanceDateToUtcDate } = require('../utils/date');
const { emitAttendanceEvent } = require('../utils/attendanceEvents');
const {
  buildAttendancePayloadHash,
  resolveCorrectionReason,
  ensureCourseExists,
  ensureTeacherCanManageCourse,
  findAttendanceByCourseAndDate,
  getCourseRoster,
  validateAttendanceRecords,
} = require('../utils/attendance');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildAttendanceRangeMatch = (req, attendanceDateField = 'attendanceDate') => {
  const from = req.query.from;
  const to = req.query.to;
  const rangeMatch = {};

  if (from) {
    rangeMatch.$gte = from;
  }

  if (to) {
    rangeMatch.$lte = to;
  }

  if (!Object.keys(rangeMatch).length) {
    return null;
  }

  return { [attendanceDateField]: rangeMatch };
};

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
    const query = { role: 'student' };
    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    if (req.user?.role === 'teacher') {
      const allowedCourseIds = (req.user.taughtCourses || []).map((course) => String(course._id || course));
      if (req.query.courseId) {
        ensureTeacherCanManageCourse(req.user, req.query.courseId);
      } else {
        query.course = { $in: allowedCourseIds };
      }
    }

    const students = await User.find(query)
      .select('name email role studentId course parentEmail parentPhone phone address studentPanelAllowed enrolledDate createdAt updatedAt')
      .populate('course', 'title duration');
    res.json(students);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load students.');
  }
};

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
// @access  Private/Admin
const getInquiries = async (_req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load inquiries.');
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/admin/inquiry/:id
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    inquiry.status = status === 'Reviewed' ? 'Reviewed' : 'New';
    await inquiry.save();

    res.json(inquiry);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update inquiry status.');
  }
};

// @desc    Get admin dashboard summary
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
const getDashboardSummary = async (_req, res) => {
  try {
    const [students, courses, materials, payments, notifications, attendanceAggregate, unpublishedResults] = await Promise.all([
      User.find({ role: 'student' }).select('name email course studentPanelAllowed createdAt').populate('course').sort({ createdAt: -1 }),
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
      Attendance.aggregate([
        { $unwind: '$records' },
        {
          $group: {
            _id: null,
            attendanceEntries: { $sum: 1 },
            attendancePresent: {
              $sum: {
                $cond: [
                  { $in: ['$records.status', ['Present', 'Late']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Result.countDocuments({ published: false }),
    ]);

    const totalRevenue = payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const pendingPayments = payments.filter((payment) => payment.status !== 'Paid').length;
    const studentsWithAccess = students.filter((student) => student.course || student.studentPanelAllowed).length;

    const attendanceEntries = attendanceAggregate[0]?.attendanceEntries || 0;
    const attendancePresent = attendanceAggregate[0]?.attendancePresent || 0;

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
    sendErrorResponse(res, error, 'Failed to load dashboard summary.');
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
    sendErrorResponse(res, error, 'Failed to delete student.');
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
    sendErrorResponse(res, error, 'Failed to register student.');
  }
};

const createManagedUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    studentId,
    parentEmail,
    parentPhone,
    phone,
    address,
    linkedStudents,
    taughtCourses,
  } = req.body;

  try {
    if (!['teacher', 'parent'].includes(role)) {
      throw new AppError(400, 'Only teacher and parent accounts can be created from this endpoint.', {
        code: 'MANAGED_USER_ROLE_INVALID',
      });
    }

    const duplicateMessage = await getDuplicateStudentMessage({ name, email, phone, studentId });
    if (duplicateMessage) {
      throw new AppError(400, duplicateMessage, { code: 'MANAGED_USER_DUPLICATE' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      studentId: role === 'teacher' ? undefined : studentId,
      parentEmail,
      parentPhone,
      phone,
      address,
      linkedStudents: role === 'parent' ? linkedStudents || [] : [],
      taughtCourses: role === 'teacher' ? taughtCourses || [] : [],
    });

    const safeUser = await User.findById(user._id)
      .select('name email role studentId course parentEmail parentPhone phone address linkedStudents taughtCourses createdAt updatedAt')
      .populate('linkedStudents', 'name email studentId course')
      .populate('taughtCourses', 'title duration');

    res.status(201).json(safeUser);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to create managed user.');
  }
};

// @desc    Create a new course
// @route   POST /api/admin/course
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { title, description, subjects, feeAmount, duration, thumbnail } = req.body;

  try {
    let finalThumbnail = thumbnail;
    if (!finalThumbnail && title) {
      const { generateSvgThumbnail } = require('../utils/thumbnailGenerator');
      const primarySubject = Array.isArray(subjects) && subjects.length ? subjects[0] : '';
      finalThumbnail = generateSvgThumbnail(title, {
        feeAmount,
        description,
        subject: primarySubject,
        subjects,
      });
    }

    const course = await Course.create({
      title, description, subjects, feeAmount, duration, thumbnail: finalThumbnail
    });
    res.status(201).json(course);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to create course.');
  }
};

// @desc    Delete a course and clean related records
// @route   DELETE /api/admin/course/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id).select('_id title');

    if (!course) {
      throw new AppError(404, 'Course not found.', { code: 'COURSE_NOT_FOUND' });
    }

    await Promise.all([
      User.updateMany({ course: id }, { $set: { course: null } }),
      User.updateMany({ enrolledCourses: id }, { $pull: { enrolledCourses: id } }),
      User.updateMany({ taughtCourses: id }, { $pull: { taughtCourses: id } }),
      CourseMaterial.deleteMany({ course: id }),
      Lesson.deleteMany({ course: id }),
      Attendance.deleteMany({ course: id }),
      Order.deleteMany({ courseId: id }),
      WatchProgress.deleteMany({ course: id }),
    ]);

    await course.deleteOne();

    res.json({
      message: 'Course deleted successfully.',
      deletedCourseId: id,
      deletedCourseTitle: course.title,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to delete course.');
  }
};

// @desc    Update a course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { subjects, chapters } = req.body;

  try {
    const course = await Course.findById(id);
    if (!course) {
      throw new AppError(404, 'Course not found.', { code: 'COURSE_NOT_FOUND' });
    }

    if (subjects !== undefined) {
      course.subjects = Array.isArray(subjects)
        ? [...new Set(subjects.map((subject) => String(subject).trim()).filter(Boolean))]
        : course.subjects;
    }
    
    if (chapters !== undefined) {
      const normalizedChapters = Object.entries(chapters || {}).reduce((acc, [subject, subjectChapters]) => {
        const normalizedSubject = String(subject).trim();
        if (!normalizedSubject) return acc;

        acc[normalizedSubject] = Array.isArray(subjectChapters)
          ? [...new Set(subjectChapters.map((chapter) => String(chapter).trim()).filter(Boolean))]
          : [];

        return acc;
      }, {});

      course.chapters = normalizedChapters;
    }

    await course.save();
    const refreshedCourse = await Course.findById(id);
    const response = refreshedCourse.toObject({ flattenMaps: true });
    res.status(200).json(response);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update course.');
  }
};

// @desc    Delete a subject from a course (moves materials to uncategorized)
const deleteSubject = async (req, res) => {
  const { id } = req.params;
  const { subject } = req.body;
  
  try {
    const course = await Course.findById(id);
    if (!course) throw new AppError(404, 'Course not found.');

    // Remove from subjects array
    course.subjects = course.subjects.filter(s => s !== subject);
    
    // Remove from chapters map
    if (course.chapters && course.chapters.has(subject)) {
      course.chapters.delete(subject);
    }
    await course.save();

    // Move materials/lessons to uncategorized
    const CourseMaterial = require('../models/CourseMaterial');
    const Lesson = require('../models/Lesson');
    
    await CourseMaterial.updateMany({ course: id, subject }, { $set: { subject: '' } });
    await Lesson.updateMany({ courseId: id, subject }, { $set: { subject: '' } });

    // Convert Map to plain object for JSON serialization
    const response = { ...course.toObject(), chapters: Object.fromEntries(course.chapters) };
    res.json(response);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to delete subject.');
  }
};

// @desc    Delete a chapter from a subject (moves materials to uncategorized chapter)
const deleteChapter = async (req, res) => {
  const { id } = req.params;
  const { subject, chapter } = req.body;
  
  try {
    const course = await Course.findById(id);
    if (!course) throw new AppError(404, 'Course not found.');

    if (course.chapters && course.chapters.has(subject)) {
      const chaps = course.chapters.get(subject).filter(c => c !== chapter);
      course.chapters.set(subject, chaps);
      await course.save();
    }

    const CourseMaterial = require('../models/CourseMaterial');
    const Lesson = require('../models/Lesson');
    
    await CourseMaterial.updateMany({ course: id, subject, moduleName: chapter }, { $set: { moduleName: '' } });
    await Lesson.updateMany({ courseId: id, subject, moduleTitle: chapter }, { $set: { moduleTitle: '' } });

    // Convert Map to plain object for JSON serialization
    const response = { ...course.toObject(), chapters: Object.fromEntries(course.chapters) };
    res.json(response);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to delete chapter.');
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
  try {
    let courses;
    if (req.user?.role === 'teacher') {
      const allowedCourseIds = (req.user.taughtCourses || []).map((course) => course._id || course);
      courses = await Course.find({ _id: { $in: allowedCourseIds } });
    } else {
      courses = await Course.find({});
    }
    // Convert chapters Map to plain object for each course
    const coursesWithPlainChapters = courses.map(course => {
      const obj = course.toObject();
      obj.chapters = Object.fromEntries(course.chapters);
      return obj;
    });
    res.json(coursesWithPlainChapters);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load courses.');
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
    sendErrorResponse(res, error, 'Failed to assign course.');
  }
};

const linkParentStudents = async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;

  try {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new AppError(400, 'Student ids are required.', { code: 'PARENT_STUDENT_IDS_REQUIRED' });
    }

    const parent = await User.findOne({ _id: id, role: 'parent' });
    if (!parent) {
      throw new AppError(404, 'Parent not found.', { code: 'PARENT_NOT_FOUND' });
    }

    const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('_id');
    if (students.length !== studentIds.length) {
      throw new AppError(400, 'One or more student ids are invalid.', { code: 'PARENT_STUDENT_IDS_INVALID' });
    }

    parent.linkedStudents = students.map((student) => student._id);
    await parent.save();

    const updatedParent = await User.findById(parent._id)
      .select('name email role linkedStudents updatedAt')
      .populate('linkedStudents', 'name email studentId course')
      .populate({
        path: 'linkedStudents',
        populate: { path: 'course', select: 'title duration' },
      });

    res.json(updatedParent);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to link parent to students.');
  }
};

const assignTeacherCourses = async (req, res) => {
  const { id } = req.params;
  const { courseIds } = req.body;

  try {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new AppError(400, 'Course ids are required.', { code: 'TEACHER_COURSE_IDS_REQUIRED' });
    }

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    if (!teacher) {
      throw new AppError(404, 'Teacher not found.', { code: 'TEACHER_NOT_FOUND' });
    }

    const courses = await Course.find({ _id: { $in: courseIds } }).select('_id');
    if (courses.length !== courseIds.length) {
      throw new AppError(400, 'One or more course ids are invalid.', { code: 'TEACHER_COURSE_IDS_INVALID' });
    }

    teacher.taughtCourses = courses.map((course) => course._id);
    await teacher.save();

    const updatedTeacher = await User.findById(teacher._id)
      .select('name email role taughtCourses updatedAt')
      .populate('taughtCourses', 'title duration');

    res.json(updatedTeacher);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to assign teacher courses.');
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
    sendErrorResponse(res, error, 'Failed to update panel access.');
  }
};

const createMaterial = async (req, res) => {
  const { course, subject, title, description, type, moduleName } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file (PDF, image, or Word document).' });
    }

    const normalizedType = type || 'Notes';
    // Store relative path — will be resolved at stream time
    const fileUrl = `local:uploads/materials/${req.file.filename}`;

    const material = await CourseMaterial.create({
      course,
      subject,
      title,
      description,
      type: normalizedType,
      moduleName,
      fileUrl,
      publishedBy: req.user._id,
    });

    const populated = await material.populate('course', 'title duration');
    res.status(201).json(populated);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to create material.');
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
    sendErrorResponse(res, error, 'Failed to delete material.');
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
    sendErrorResponse(res, error, 'Failed to load materials.');
  }
};

const createFreeStudyMaterial = async (req, res) => {
  const { title, description, section, classLabel } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file for the free study material.' });
    }

    if (!title?.trim() || !section?.trim()) {
      return res.status(400).json({ message: 'Title and section are required.' });
    }

    const material = await FreeStudyMaterial.create({
      title: title.trim(),
      description: description?.trim() || '',
      section: section.trim(),
      classLabel: classLabel?.trim() || '',
      fileUrl: `/uploads/free-materials/${req.file.filename}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      publishedBy: req.user._id,
    });

    const populated = await material.populate('publishedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to publish free study material.');
  }
};

const getFreeStudyMaterials = async (_req, res) => {
  try {
    const materials = await FreeStudyMaterial.find({})
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load free study materials.');
  }
};

const deleteFreeStudyMaterial = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await FreeStudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ message: 'Free study material not found.' });
    }

    await material.deleteOne();
    res.json({ message: 'Free study material deleted successfully.' });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to delete free study material.');
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
    sendErrorResponse(res, error, 'Failed to load payment records.');
  }
};

const getAttendanceRecord = async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query;

  try {
    if (!date) {
      throw new AppError(400, 'Attendance date is required.', { code: 'ATTENDANCE_DATE_REQUIRED' });
    }

    await ensureCourseExists(courseId);
    ensureTeacherCanManageCourse(req.user, courseId);

    const { attendanceDate, attendance } = await findAttendanceByCourseAndDate(courseId, date);
    const roster = await getCourseRoster(courseId);

    if (!attendance) {
      return res.json(null);
    }

    const rosterById = roster.reduce((map, student) => {
      map[String(student._id)] = student;
      return map;
    }, {});

    const versionToken = `admin-attendance:${courseId}:${attendanceDate}:${attendance.updatedAt?.getTime?.() || 0}:${attendance.revision || 1}`;
    if (applyRevalidationHeaders(req, res, versionToken)) {
      return;
    }

    res.set('Last-Modified', new Date(attendance.updatedAt).toUTCString());
    res.set('X-Attendance-Date', attendanceDate);
    res.set('X-Attendance-Revision', String(attendance.revision || 1));

    res.json({
      ...attendance.toObject(),
      roster,
      records: (attendance.records || []).map((record) => ({
        studentId: record.studentId,
        status: record.status,
        student: rosterById[String(record.studentId)] || null,
      })),
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load attendance record.');
  }
};

const getAttendanceSummary = async (req, res) => {
  const { courseId } = req.query;

  try {
    if (!courseId) {
      throw new AppError(400, 'courseId is required.', { code: 'COURSE_ID_REQUIRED' });
    }

    await ensureCourseExists(courseId);
    ensureTeacherCanManageCourse(req.user, courseId);

    const rangeMatch = buildAttendanceRangeMatch(req);
    const pipeline = [
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    ];
    if (rangeMatch) {
      pipeline.push({ $match: rangeMatch });
    }

    pipeline.push(
      { $unwind: '$records' },
      {
        $group: {
          _id: { $substrBytes: ['$attendanceDate', 0, 7] },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$records.status', ['Present', 'Late']] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'Absent'] }, 1, 0],
            },
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'Late'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } }
    );

    const summaryRows = await Attendance.aggregate(pipeline);
    res.json({
      courseId,
      range: {
        from: req.query.from || null,
        to: req.query.to || null,
      },
      months: summaryRows.map((row) => ({
        month: row._id,
        totalEntries: row.total,
        presentEntries: row.present,
        absentEntries: row.absent,
        lateEntries: row.late,
        attendancePercentage: row.total ? Math.round((row.present / row.total) * 100) : 0,
      })),
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load attendance summary.');
  }
};

const getAttendanceTrends = async (req, res) => {
  const { courseId } = req.query;

  try {
    if (!courseId) {
      throw new AppError(400, 'courseId is required.', { code: 'COURSE_ID_REQUIRED' });
    }

    await ensureCourseExists(courseId);
    ensureTeacherCanManageCourse(req.user, courseId);

    const rangeMatch = buildAttendanceRangeMatch(req);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 31), 120);
    const pipeline = [
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    ];

    if (rangeMatch) {
      pipeline.push({ $match: rangeMatch });
    }

    pipeline.push(
      { $unwind: '$records' },
      {
        $group: {
          _id: '$attendanceDate',
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$records.status', ['Present', 'Late']] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'Absent'] }, 1, 0],
            },
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'Late'] }, 1, 0],
            },
          },
          updatedAt: { $max: '$updatedAt' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      { $sort: { _id: 1 } }
    );

    const trendRows = await Attendance.aggregate(pipeline);
    res.json({
      courseId,
      range: {
        from: req.query.from || null,
        to: req.query.to || null,
      },
      points: trendRows.map((row) => ({
        attendanceDate: row._id,
        totalEntries: row.total,
        presentEntries: row.present,
        absentEntries: row.absent,
        lateEntries: row.late,
        attendancePercentage: row.total ? Math.round((row.present / row.total) * 100) : 0,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load attendance trends.');
  }
};

const saveAttendanceRecord = async (req, res) => {
  const { courseId } = req.params;
  const { date, records, correctionReason } = req.body;

  try {
    if (!date) {
      throw new AppError(400, 'Attendance date is required.', { code: 'ATTENDANCE_DATE_REQUIRED' });
    }

    await ensureCourseExists(courseId);
    ensureTeacherCanManageCourse(req.user, courseId);

    const { attendanceDate, attendance: existingAttendance } = await findAttendanceByCourseAndDate(courseId, date);
    const { normalizedRecords } = await validateAttendanceRecords({ courseId, records });
    const payloadHash = buildAttendancePayloadHash(normalizedRecords);
    const requestId = req.requestContext?.idempotencyKey || createRequestFingerprint({
      courseId,
      attendanceDate,
      payloadHash,
    });
    const normalizedDate = attendanceDateToUtcDate(attendanceDate);

    if (existingAttendance?.lastRequestId === requestId && existingAttendance?.lastPayloadHash === payloadHash) {
      res.set('X-Idempotent-Replay', 'true');
      return res.json(existingAttendance);
    }

    const existingHash = existingAttendance ? buildAttendancePayloadHash(existingAttendance.records || []) : null;
    const effectiveCorrectionReason = resolveCorrectionReason({
      existingAttendance,
      existingPayloadHash: existingHash,
      nextPayloadHash: payloadHash,
      correctionReason,
    });

    if (existingAttendance) {
      res.set('X-Attendance-Correction-Reason', effectiveCorrectionReason || '');
    }

    const now = new Date();
    const attendance = await Attendance.findOneAndUpdate(
      { course: courseId, attendanceDate },
      existingAttendance ? {
        $set: {
          attendanceDate,
          date: normalizedDate,
          records: normalizedRecords,
          updatedBy: req.user._id,
          correctionReason: effectiveCorrectionReason,
          lastRequestId: requestId,
          lastPayloadHash: payloadHash,
          updatedAt: now,
        },
        $inc: { revision: 1 },
        $push: {
          auditLog: {
            action: 'updated',
            changedBy: req.user._id,
            changedAt: now,
            correctionReason: effectiveCorrectionReason,
            requestId,
            payloadHash,
          },
        },
      } : {
        $setOnInsert: {
          course: courseId,
          attendanceDate,
          date: normalizedDate,
          records: normalizedRecords,
          markedBy: req.user._id,
          updatedBy: req.user._id,
          correctionReason: effectiveCorrectionReason,
          lastRequestId: requestId,
          lastPayloadHash: payloadHash,
          auditLog: [{
            action: 'created',
            changedBy: req.user._id,
            changedAt: now,
            correctionReason: effectiveCorrectionReason,
            requestId,
            payloadHash,
          }],
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    emitAttendanceEvent(existingAttendance ? 'attendance.updated' : 'attendance.marked', {
      attendanceId: attendance._id,
      courseId,
      attendanceDate: attendance.attendanceDate,
      actorUserId: req.user._id,
      correctionReason: attendance.correctionReason || '',
      revision: attendance.revision || 1,
    });

    res.set('X-Attendance-Date', attendance.attendanceDate);
    res.set('X-Attendance-Revision', String(attendance.revision || 1));
    res.json(attendance);
  } catch (error) {
    if (error?.code === 11000) {
      return sendErrorResponse(res, new AppError(409, 'Attendance already exists for this course and date.', {
        code: 'ATTENDANCE_DUPLICATE_DATE',
      }));
    }

    sendErrorResponse(res, error, 'Failed to save attendance.');
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('studentId', 'name email studentId')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load notifications.');
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
    sendErrorResponse(res, error, 'Failed to create notification.');
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
    sendErrorResponse(res, error, 'Failed to update notification.');
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
    sendErrorResponse(res, error, 'Failed to upload results.');
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
    sendErrorResponse(res, error, 'Failed to create results.');
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
    sendErrorResponse(res, error, 'Failed to publish results.');
  }
};

module.exports = { getStudents, getInquiries, updateInquiryStatus, getDashboardSummary, registerStudent, createManagedUser, linkParentStudents, assignTeacherCourses, deleteStudent, createCourse, deleteCourse, updateCourse, deleteSubject, deleteChapter, getCourses, assignStudentCourse, createMaterial, deleteMaterial, getMaterials, createFreeStudyMaterial, getFreeStudyMaterials, deleteFreeStudyMaterial, getPaymentRecords, getAttendanceRecord, getAttendanceSummary, getAttendanceTrends, saveAttendanceRecord, getNotifications, createNotification, updateNotification, toggleStudentPanel, uploadResults, createResultsFromRows, publishResults };
