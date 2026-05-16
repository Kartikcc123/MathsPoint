const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const { sendEmail, generateReportTemplate } = require('../utils/emailService');

/**
 * Aggregates attendance data for a specific student
 */
const getAttendanceSummary = async (studentId) => {
  const attendanceRecords = await Attendance.find({ 'records.studentId': studentId });
  
  let total = 0;
  let present = 0;
  let absent = 0;

  attendanceRecords.forEach(record => {
    const studentRecord = record.records.find(r => r.studentId.toString() === studentId.toString());
    if (studentRecord) {
      total++;
      if (studentRecord.status === 'Present') present++;
      else if (studentRecord.status === 'Absent') absent++;
    }
  });

  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return { total, present, absent, percentage };
};

/**
 * Sends a comprehensive report to a single student and their parent
 */
exports.sendIndividualReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1. Get Attendance Summary
    const attendanceSummary = await getAttendanceSummary(studentId);

    // 2. Get Recent Test Results
    const results = await Result.find({ studentId, published: true }).sort({ date: -1 }).limit(10);

    // 3. Generate HTML
    const html = generateReportTemplate(student, attendanceSummary, results);

    // 4. Determine recipients
    const recipients = [student.email];
    if (student.parentEmail) {
      recipients.push(student.parentEmail);
    }

    // 5. Send Email
    const emailResult = await sendEmail({
      to: recipients.join(','),
      subject: `Academic Progress Report: ${student.name}`,
      html,
    });

    if (emailResult.success) {
      res.status(200).json({ message: 'Report sent successfully', recipients });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: emailResult.error });
    }
  } catch (error) {
    console.error('Report Controller Error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

/**
 * Sends reports to all students in a specific course
 */
exports.sendBatchReport = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await User.find({ course: courseId, role: 'student' });
    if (!students.length) {
      return res.status(404).json({ message: 'No students found in this course' });
    }

    const resultsSummary = [];
    
    // We send emails sequentially to avoid hitting rate limits or overwhelming the transporter
    // For a large number of students, this should ideally be a background job (bullmq/redis)
    for (const student of students) {
      const attendanceSummary = await getAttendanceSummary(student._id);
      const results = await Result.find({ studentId: student._id, published: true }).sort({ date: -1 }).limit(5);
      
      const html = generateReportTemplate(student, attendanceSummary, results);
      
      const recipients = [student.email];
      if (student.parentEmail) recipients.push(student.parentEmail);

      const emailResult = await sendEmail({
        to: recipients.join(','),
        subject: `Class Progress Report: ${student.name}`,
        html,
      });

      resultsSummary.push({
        student: student.name,
        success: emailResult.success,
        error: emailResult.error
      });
    }

    res.status(200).json({ 
      message: 'Batch processing completed', 
      summary: resultsSummary 
    });
  } catch (error) {
    console.error('Batch Report Error:', error);
    res.status(500).json({ message: 'Server error in batch reporting' });
  }
};
