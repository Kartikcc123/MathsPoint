const Course = require('../models/Course');

const getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicCourses };
