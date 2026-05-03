const User = require('../models/User');
const { AppError, applyRevalidationHeaders, sendErrorResponse } = require('../utils/api');
const { normalizeAttendanceDateInput } = require('../utils/date');
const { canParentAccessStudent, serializeAttendanceForStudent } = require('../utils/attendance');

const getParentChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id)
      .select('name email linkedStudents')
      .populate({
        path: 'linkedStudents',
        select: 'name email studentId course',
        populate: { path: 'course', select: 'title duration' },
      });

    const children = (parent?.linkedStudents || []).map((child) => ({
      _id: child._id,
      name: child.name,
      email: child.email,
      studentId: child.studentId,
      course: child.course || null,
    }));

    res.json({
      parentId: req.user._id,
      childCount: children.length,
      children,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load linked students.');
  }
};

const getChildAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    const parent = await User.findById(req.user._id).select('linkedStudents');
    if (!canParentAccessStudent(parent, studentId)) {
      throw new AppError(403, 'You do not have access to this student attendance.', {
        code: 'PARENT_STUDENT_FORBIDDEN',
      });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' }).select('name email studentId course').populate('course', 'title duration');
    if (!student) {
      throw new AppError(404, 'Student not found.', { code: 'PARENT_STUDENT_NOT_FOUND' });
    }

    const from = req.query.from ? normalizeAttendanceDateInput(req.query.from) : null;
    const to = req.query.to ? normalizeAttendanceDateInput(req.query.to) : null;
    if ((req.query.from && !from) || (req.query.to && !to)) {
      throw new AppError(400, 'Invalid attendance range.', { code: 'ATTENDANCE_RANGE_INVALID' });
    }

    const attendanceSummary = student.course
      ? await serializeAttendanceForStudent({ studentId: student._id, courseId: student.course._id, from, to })
      : { attendanceRecords: [], attendancePercentage: 0, latestUpdateAt: null };

    const versionToken = `parent-attendance:${req.user._id}:${student._id}:${attendanceSummary.latestUpdateAt?.getTime?.() || 0}:${attendanceSummary.attendanceRecords.length}`;
    if (applyRevalidationHeaders(req, res, versionToken)) {
      return;
    }

    res.json({
      parentId: req.user._id,
      student,
      attendanceRecords: attendanceSummary.attendanceRecords,
      attendancePercentage: attendanceSummary.attendancePercentage,
      syncedAt: attendanceSummary.latestUpdateAt,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load child attendance.');
  }
};

module.exports = {
  getParentChildren,
  getChildAttendance,
};
