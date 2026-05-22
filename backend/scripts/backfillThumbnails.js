const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Course = require('../models/Course');
const { generateSvgThumbnail } = require('../utils/thumbnailGenerator');

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to database.');

  // Regenerate ALL thumbnails with the new premium design
  const courses = await Course.find({});

  console.log('Found ' + courses.length + ' courses. Regenerating all thumbnails...');

  for (const course of courses) {
    const primarySubject = Array.isArray(course.subjects) && course.subjects.length ? course.subjects[0] : '';
    course.thumbnail = generateSvgThumbnail(course.title, {
      feeAmount: course.feeAmount,
      description: course.description,
      subject: primarySubject,
      subjects: course.subjects,
    });
    await course.save();
    console.log('  ✓ ' + course.title);
  }

  console.log('\nAll done!');
  await mongoose.disconnect();
}

backfill().catch(e => { console.error(e); process.exit(1); });
