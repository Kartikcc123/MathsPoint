const express = require('express');
const router = express.Router();
const { getPublicCourses, createPublicInquiry, getPublicFreeStudyMaterials } = require('../controllers/publicController');
const { getPublicHomeContent } = require('../controllers/homeContentController');

router.get('/courses', getPublicCourses);
router.get('/home-content', getPublicHomeContent);
router.get('/free-study-materials', getPublicFreeStudyMaterials);
router.post('/inquiry', createPublicInquiry);

module.exports = router;
