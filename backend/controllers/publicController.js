const Course = require('../models/Course');
const FreeStudyMaterial = require('../models/FreeStudyMaterial');
const Inquiry = require('../models/Inquiry');
const { sendErrorResponse } = require('../utils/api');

const getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load public courses.');
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
    sendErrorResponse(res, error, 'Failed to create inquiry.');
  }
};

const getPublicFreeStudyMaterials = async (req, res) => {
  try {
    const section = req.query.section?.trim();
    const filter = section ? { section } : {};

    const materials = await FreeStudyMaterial.find(filter)
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load free study materials.');
  }
};

module.exports = { getPublicCourses, createPublicInquiry, getPublicFreeStudyMaterials };
