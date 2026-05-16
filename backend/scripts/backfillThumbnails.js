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
    course.thumbnail = generateSvgThumbnail(course.title, { feeAmount: course.feeAmount });
    await course.save();
    console.log('  ✓ ' + course.title);
  }

  console.log('\nAll done!');
  await mongoose.disconnect();
}

backfill().catch(e => { console.error(e); process.exit(1); });
