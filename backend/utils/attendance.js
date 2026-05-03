const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Course = require('../models/Course');
const { AppError, createRequestFingerprint } = require('./api');
const { getAttendanceDateRange, normalizeAttendanceDateInput } = require('./date');

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late'];

const normalizeStudentIdList = (studentIds = []) => [...new Set(studentIds.map((id) => String(id)))].sort();

const hasDuplicateStudentIds = (records = []) => {
  const providedIds = records.map((record) => String(record.studentId || ''));
  return providedIds.filter((studentId, index) => providedIds.indexOf(studentId) !== index);
};

const buildAttendancePayloadHash = (records) => {
  const normalized = records
    .map((record) => ({
      studentId: String(record.studentId),
      status: record.status,
    }))
    .sort((left, right) => left.studentId.localeCompare(right.studentId));

  return createRequestFingerprint(normalized);
};

const getCourseRoster = async (courseId) => User.find({
  role: 'student',
  course: courseId,
}).select('_id name email studentId phone parentPhone course').sort({ name: 1, _id: 1 }).lean();

const ensureCourseExists = async (courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new AppError(400, 'Invalid course id.', { code: 'INVALID_COURSE_ID' });
  }

  const course = await Course.findById(courseId).select('_id title duration');
  if (!course) {
    throw new AppError(404, 'Course not found.', { code: 'COURSE_NOT_FOUND' });
  }

  return course;
};

const ensureTeacherCanManageCourse = (user, courseId) => {
  if (user.role === 'admin') {
    return;
  }

  const allowedCourseIds = (user.taughtCourses || []).map((course) => String(course._id || course));
  if (!allowedCourseIds.includes(String(courseId))) {
    throw new AppError(403, 'Teacher is not assigned to this course.', { code: 'COURSE_ACCESS_DENIED' });
  }
};

const canParentAccessStudent = (parentUser, studentId) => {
  const linkedStudentIds = (parentUser?.linkedStudents || []).map((student) => String(student._id || student));
  return linkedStudentIds.includes(String(studentId));
};

const resolveCorrectionReason = ({ existingAttendance, existingPayloadHash, nextPayloadHash, correctionReason }) => {
  const trimmedReason = correctionReason?.trim() || '';
  if (!existingAttendance) {
    return trimmedReason;
  }

  if (existingPayloadHash === nextPayloadHash) {
    return trimmedReason;
  }

  if (trimmedReason) {
    return trimmedReason;
  }

  return 'Compatibility fallback: attendance updated without explicit correction reason from legacy admin client.';
};

const validateAttendanceRecords = async ({ courseId, records }) => {
  if (!Array.isArray(records) || records.length === 0) {
    throw new AppError(400, 'Attendance records are required.', { code: 'ATTENDANCE_RECORDS_REQUIRED' });
  }

  const roster = await getCourseRoster(courseId);
  const rosterIds = roster.map((student) => String(student._id));
  const providedIds = records.map((record) => String(record.studentId || ''));
  const duplicateIds = hasDuplicateStudentIds(records);

  if (duplicateIds.length) {
    throw new AppError(409, 'Duplicate student entries are not allowed.', {
      code: 'ATTENDANCE_DUPLICATE_STUDENT',
      details: { studentIds: normalizeStudentIdList(duplicateIds) },
    });
  }

  const invalidStatuses = records.filter((record) => !ATTENDANCE_STATUSES.includes(record.status));
  if (invalidStatuses.length) {
    throw new AppError(400, 'Invalid attendance status provided.', {
      code: 'ATTENDANCE_INVALID_STATUS',
      details: { allowedStatuses: ATTENDANCE_STATUSES },
    });
  }

  const unknownStudents = providedIds.filter((studentId) => !rosterIds.includes(studentId));
  if (unknownStudents.length) {
    throw new AppError(400, 'Attendance payload contains students outside the selected course.', {
      code: 'ATTENDANCE_STUDENT_NOT_IN_COURSE',
      details: { studentIds: normalizeStudentIdList(unknownStudents) },
    });
  }

  const missingStudents = rosterIds.filter((studentId) => !providedIds.includes(studentId));
  if (missingStudents.length) {
    throw new AppError(400, 'Attendance submission must include the full course roster.', {
      code: 'ATTENDANCE_INCOMPLETE_ROSTER',
      details: { missingStudentIds: normalizeStudentIdList(missingStudents) },
    });
  }

  return {
    roster,
    normalizedRecords: records.map((record) => ({
      studentId: record.studentId,
      status: record.status,
    })),
  };
};

const findAttendanceByCourseAndDate = async (courseId, dateInput) => {
  const attendanceDate = normalizeAttendanceDateInput(dateInput);
  if (!attendanceDate) {
    throw new AppError(400, 'Invalid attendance date.', { code: 'ATTENDANCE_INVALID_DATE' });
  }

  const legacyRange = getAttendanceDateRange(attendanceDate);

  const attendance = await Attendance.findOne({
    course: courseId,
    $or: [
      { attendanceDate },
      legacyRange ? {
        attendanceDate: { $exists: false },
        date: { $gte: legacyRange.start, $lt: legacyRange.end },
      } : null,
    ].filter(Boolean),
  });

  return { attendanceDate, attendance };
};

const serializeAttendanceForStudent = async ({ studentId, courseId, from, to }) => {
  const query = {
    course: courseId,
    'records.studentId': studentId,
  };

  if (from || to) {
    query.attendanceDate = {};
    if (from) query.attendanceDate.$gte = from;
    if (to) query.attendanceDate.$lte = to;
  }

  const attendanceDocs = await Attendance.find(query)
    .select('attendanceDate date records updatedAt revision')
    .sort({ attendanceDate: 1 })
    .lean();

  const attendanceRecords = attendanceDocs
    .map((entry) => {
      const record = (entry.records || []).find((item) => String(item.studentId) === String(studentId));
      if (!record) return null;

      return {
        date: entry.date,
        attendanceDate: entry.attendanceDate,
        status: record.status,
        updatedAt: entry.updatedAt,
      };
    })
    .filter(Boolean);

  const attendedCount = attendanceRecords.filter((entry) => entry.status === 'Present' || entry.status === 'Late').length;
  const attendancePercentage = attendanceRecords.length
    ? Math.round((attendedCount / attendanceRecords.length) * 100)
    : 0;

  return {
    attendanceRecords,
    attendancePercentage,
    latestUpdateAt: attendanceRecords.length ? attendanceRecords[attendanceRecords.length - 1].updatedAt : null,
  };
};

module.exports = {
  ATTENDANCE_STATUSES,
  buildAttendancePayloadHash,
  canParentAccessStudent,
  ensureCourseExists,
  ensureTeacherCanManageCourse,
  findAttendanceByCourseAndDate,
  getCourseRoster,
  hasDuplicateStudentIds,
  resolveCorrectionReason,
  serializeAttendanceForStudent,
  validateAttendanceRecords,
};
