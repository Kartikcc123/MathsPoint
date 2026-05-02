const express = require('express');
const router = express.Router();
const { getPublicCourses, createPublicInquiry } = require('../controllers/publicController');

router.get('/courses', getPublicCourses);
router.post('/inquiry', createPublicInquiry);

module.exports = router;
