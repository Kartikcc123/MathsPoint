const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Use environment variables for SMTP configuration
  // If not provided, it will fail gracefully or you can use a test service like Ethereal
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Maths Point Administration" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generates a professional HTML template for the student report
 */
const generateReportTemplate = (student, attendanceSummary, results) => {
  const resultRows = results.map(r => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.examName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.subject}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.marksObtained} / ${r.totalMarks}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${((r.marksObtained / r.totalMarks) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Maths Point</h1>
        <p style="margin: 5px 0 0;">Student Progress Report</p>
      </div>
      <div style="padding: 20px;">
        <h3>Hello ${student.name},</h3>
        <p>Please find below your academic progress report as of ${new Date().toLocaleDateString()}.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #4f46e5;">Attendance Summary</h4>
          <p>Total Classes: <strong>${attendanceSummary.total}</strong></p>
          <p>Attended: <strong style="color: green;">${attendanceSummary.present}</strong></p>
          <p>Absent: <strong style="color: red;">${attendanceSummary.absent}</strong></p>
          <p>Attendance Percentage: <strong>${attendanceSummary.percentage}%</strong></p>
        </div>

        <h4 style="color: #4f46e5;">Recent Test Results</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 10px;">Exam</th>
              <th style="padding: 10px;">Subject</th>
              <th style="padding: 10px;">Marks</th>
              <th style="padding: 10px;">%</th>
            </tr>
          </thead>
          <tbody>
            ${resultRows || '<tr><td colspan="4" style="text-align: center; padding: 10px;">No results published yet.</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated report from Maths Point Admin Panel. If you have any questions, please contact the administration.</p>
        </div>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  generateReportTemplate,
};
