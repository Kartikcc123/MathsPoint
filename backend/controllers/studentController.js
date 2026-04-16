const User = require('../models/User');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const CourseMaterial = require('../models/CourseMaterial');
const Notification = require('../models/Notification');

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId).populate('course');

    const fees = await Fee.find({ studentId }).sort({ dueDate: -1 });
    const results = await Result.find({ studentId }).sort({ date: -1 });
    const materials = student?.course
      ? await CourseMaterial.find({ course: student.course._id }).sort({ createdAt: -1 })
      : [];
    const attendanceDocs = student?.course
      ? await Attendance.find({ course: student.course._id }).sort({ date: -1 })
      : [];

    const attendanceRecords = attendanceDocs
      .map((entry) => {
        const record = entry.records.find((item) => String(item.studentId) === String(studentId));
        if (!record) return null;

        return {
          date: entry.date,
          status: record.status,
        };
      })
      .filter(Boolean);

    const attendedCount = attendanceRecords.filter((entry) => entry.status === 'Present' || entry.status === 'Late').length;
    const attendancePercentage = attendanceRecords.length
      ? Math.round((attendedCount / attendanceRecords.length) * 100)
      : 0;
    
    res.json({
      fees,
      results,
      materials,
      course: student?.course || null,
      user: student,
      attendanceRecords,
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

const getStudentPayments = async (req, res) => {
  try {
    const payments = await Fee.find({ studentId: req.user._id }).sort({ dueDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentDashboard, getStudentMaterials, getStudentPayments, payStudentFee, getStudentNotifications };
