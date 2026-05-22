const express = require('express');
const router = express.Router();
const { getPublicCourses, createPublicInquiry, getPublicFreeStudyMaterials } = require('../controllers/publicController');

router.get('/courses', getPublicCourses);
router.get('/free-study-materials', getPublicFreeStudyMaterials);
router.post('/inquiry', createPublicInquiry);

module.exports = router;
