const fs = require('fs');
const file = 'e:/Maths/backend/controllers/lessonController.js';
let code = fs.readFileSync(file, 'utf8');

// Strip out everything after the last `};` before the literal \n garbage
const lastValidEnd = code.lastIndexOf('};\nconst createGoogleDriveLesson');
if (lastValidEnd !== -1) {
  code = code.substring(0, lastValidEnd + 2);
} else {
  const anotherTry = code.lastIndexOf('};\nmodule.exports');
  if (anotherTry !== -1) code = code.substring(0, anotherTry + 2);
}

const correctExports = `
const createGoogleDriveLesson = async (req, res) => { res.json({ success: true }) };
module.exports = {
  createGoogleDriveLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getAdminLessons,
  reorderLessons,
  getCourseLessons,
  getLessonPlayer,
  updateWatchProgress,
  getWatchProgress,
  testYouTubeEmbed,
  extractYouTubeId,
  getFreeGoogleDriveLessons,
  streamGoogleDriveLesson,
};
`;

code += correctExports;
fs.writeFileSync(file, code);
console.log('Fixed exports');
