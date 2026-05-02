const Course = require('../models/Course');
const Inquiry = require('../models/Inquiry');

const getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPublicInquiry = async (req, res) => {
  const { name, email, phone, subject, message, program } = req.body;

  try {
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      program: program?.trim(),
    });

    res.status(201).json({
      message: 'Inquiry sent successfully. Our team will contact you soon.',
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicCourses, createPublicInquiry };
