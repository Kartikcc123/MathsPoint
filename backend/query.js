const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Lesson = require('./models/Lesson');
  const allLessons = await Lesson.find({});
  const lesson = allLessons.find(l => l._id.toString().startsWith('6a98280'));
  console.log('--- LESSON ---');
  console.log(lesson);
  process.exit(0);
});
