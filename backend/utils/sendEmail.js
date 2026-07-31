const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for Gmail
    auth: {
      user: process.env.SMTP_EMAIL, // e.g. your email address
      pass: process.env.SMTP_PASSWORD, // e.g. your app password
    },
  });

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME || 'Maths Point'} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional: if we want to send HTML emails
  };

  // Send the email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
