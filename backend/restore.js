const fs = require('fs');
const path = require('path');

const filePath = path.join('e:', 'Maths', 'backend', 'controllers', 'lessonController.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add missing imports
if (!code.includes('googleDriveService')) {
  code = code.replace(
    "const { AppError, sendErrorResponse } = require('../utils/api');",
    "const { AppError, sendErrorResponse } = require('../utils/api');\nconst { getDriveFileMetadata, getDriveFileStream } = require('../services/googleDriveService');\nconst mongoose = require('mongoose');"
  );
}

// 2. Add helper functions
const helpers = `
const assertValidObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, \`Invalid \${fieldName} format.\`, { code: 'INVALID_OBJECT_ID' });
  }
};

const appSupportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
const isAppSupportedVideoType = (mimeType) => appSupportedVideoTypes.includes(mimeType);

const getLessonVideoKind = (lesson) => {
  if (lesson.videoType === 'google_drive') return 'google_drive';
  if (!lesson.encryptedVideoId && !lesson.videoIV && !lesson.videoUrl && lesson.driveFileId) return 'google_drive';
  if (lesson.encryptedVideoId && lesson.videoIV) return 'youtube';
  return 'unconfigured';
};

const parseRangeHeader = (rangeHeader, fileSize) => {
  if (!rangeHeader) return null;
  const parts = rangeHeader.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  return { start, end };
};

const assertLessonAccess = (lesson, student) => {
  if (!lesson.isPublished && !lesson.isFree) {
    throw new AppError(404, 'Lesson not available.', { code: 'LESSON_NOT_AVAILABLE' });
  }
  if (!lesson.isFree) {
    const courseId = lesson.course.toString();
    const isEnrolled = student.course?._id?.toString() === courseId ||
      (student.enrolledCourses || []).some((c) => (c._id || c).toString() === courseId);
    if (!isEnrolled) {
      throw new AppError(403, 'You are not enrolled in this course.', { code: 'LESSON_NOT_ENROLLED' });
    }
  }
};
`;

if (!code.includes('getLessonVideoKind')) {
  code = code.replace(
    "const getLessonPlayer = async (req, res) => {",
    helpers + "\nconst getLessonPlayer = async (req, res) => {"
  );
}

// 3. Fix getLessonPlayer
const oldGetLessonPlayer = `const getLessonPlayer = async (req, res) => {
  try {
    const student = req.user;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    if (!lesson.isPublished && !lesson.isFree) {
      throw new AppError(404, 'Lesson not available.', { code: 'LESSON_NOT_AVAILABLE' });
    }

    // Verify enrollment (skip for free lessons)
    if (!lesson.isFree) {
      const courseId = lesson.course.toString();
      const isEnrolled = student.course?._id?.toString() === courseId ||
        (student.enrolledCourses || []).some((c) => (c._id || c).toString() === courseId);

      if (!isEnrolled) {
        throw new AppError(403, 'You are not enrolled in this course.', { code: 'LESSON_NOT_ENROLLED' });
      }
    }

    // Decrypt the YouTube video ID internally`;

const newGetLessonPlayer = `const getLessonPlayer = async (req, res) => {
  try {
    const student = req.user;
    assertValidObjectId(req.params.id, 'Lesson ID');

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    assertLessonAccess(lesson, student);

    const existingProgress = await WatchProgress.findOne({
      student: student._id,
      lesson: lesson._id,
    });

    const videoKind = getLessonVideoKind(lesson);

    if (videoKind === 'google_drive') {
      if (!lesson.driveFileId) {
        throw new AppError(400, 'This app video is missing its Google Drive file id.', { code: 'DRIVE_FILE_ID_MISSING' });
      }

      return res.json({
        videoType: 'google_drive',
        streamUrl: \`/api/videos/\${lesson._id}/stream\`,
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          moduleTitle: lesson.moduleTitle,
          duration: lesson.duration,
          course: lesson.course,
          thumbnail: lesson.thumbnail,
          thumbnailUrl: lesson.thumbnailUrl,
          mimeType: lesson.mimeType,
          size: lesson.size,
        },
        watermark: {
          name: student.name,
          email: student.email,
          timestamp: new Date().toISOString(),
        },
        progress: existingProgress?.progress || 0,
      });
    }

    if (videoKind === 'unconfigured') {
      throw new AppError(400, 'This lesson has no playable video configured.', { code: 'LESSON_VIDEO_UNCONFIGURED' });
    }

    if (!lesson.encryptedVideoId || !lesson.videoIV) {
      throw new AppError(400, 'This website lesson is missing encrypted YouTube video data.', { code: 'YOUTUBE_VIDEO_CONFIG_MISSING' });
    }

    // Decrypt the YouTube video ID internally`;

if (!code.includes('videoKind === \'google_drive\'')) {
  code = code.replace(oldGetLessonPlayer, newGetLessonPlayer);
}

// 4. Update existing progress usage
const oldProgressUsage = `    // Get existing progress
    const existingProgress = await WatchProgress.findOne({
      student: student._id,
      lesson: lesson._id,
    });`;

code = code.replace(oldProgressUsage, "");

// 5. Add streamGoogleDriveLesson and getFreeGoogleDriveLessons
const additionalMethods = `
// @desc    Get free google drive lessons
// @route   GET /api/lessons/free/google-drive
// @access  Private (Student)
const getFreeGoogleDriveLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ isFree: true, isPublished: true, videoType: 'google_drive' });
    res.json(lessons);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to fetch free drive lessons');
  }
};

// @desc    Stream a protected Google Drive lesson video
// @route   GET /api/videos/:id/stream
// @access  Private (Student)
const streamGoogleDriveLesson = async (req, res) => {
  try {
    const student = req.user;
    assertValidObjectId(req.params.id, 'Lesson ID');

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    const isGoogleDriveVideo = getLessonVideoKind(lesson) === 'google_drive';

    if (!isGoogleDriveVideo || !lesson.driveFileId) {
      throw new AppError(404, 'Google Drive video not found.', { code: 'DRIVE_VIDEO_NOT_FOUND' });
    }

    assertLessonAccess(lesson, student);

    let fileSize = Number(lesson.size || 0);
    let mimeType = lesson.mimeType || 'video/mp4';

    if (mimeType && !isAppSupportedVideoType(mimeType)) {
      throw new AppError(415, 'This video format is not supported by the app player. Upload MP4 H.264/AAC for testing.', {
        code: 'DRIVE_VIDEO_UNSUPPORTED_FORMAT',
        details: { mimeType, supported: appSupportedVideoTypes },
      });
    }

    if (!fileSize || !mimeType) {
      const metadata = await getDriveFileMetadata(lesson.driveFileId);
      fileSize = Number(metadata.size || 0);
      mimeType = metadata.mimeType || mimeType;
    }

    if (!isAppSupportedVideoType(mimeType)) {
      throw new AppError(415, 'This video format is not supported by the app player. Upload MP4 H.264/AAC for testing.', {
        code: 'DRIVE_VIDEO_UNSUPPORTED_FORMAT',
        details: { mimeType, supported: appSupportedVideoTypes },
      });
    }

    if (!fileSize) {
      throw new AppError(500, 'Google Drive video size is unavailable.', { code: 'DRIVE_VIDEO_SIZE_MISSING' });
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline');
    
    // IMPORTANT: Keep original CORS behavior from index.js (no special logic here)
    // The user explicitly stated: "Do not make CORS changes based on the previous investigation"
    
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length, Content-Type');

    const range = parseRangeHeader(req.headers.range, fileSize);

    if (range) {
      const contentLength = range.end - range.start + 1;
      res.status(206);
      res.setHeader('Content-Range', \`bytes \${range.start}-\${range.end}/\${fileSize}\`);
      res.setHeader('Content-Length', contentLength);
    } else {
      res.status(200);
      res.setHeader('Content-Length', fileSize);
    }

    if (req.method === 'HEAD') {
      return res.end();
    }

    const driveRange = range ? \`bytes=\${range.start}-\${range.end}\` : undefined;
    const driveResponse = await getDriveFileStream(lesson.driveFileId, driveRange);

    driveResponse.data.on('error', () => {
      if (!res.headersSent) {
        res.status(502).end();
      } else {
        res.end();
      }
    });

    driveResponse.data.pipe(res);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 416) {
      const lesson = await Lesson.findById(req.params.id).select('size').catch(() => null);
      const fileSize = Number(lesson?.size || 0);
      res.setHeader('Accept-Ranges', 'bytes');
      if (fileSize) res.setHeader('Content-Range', \`bytes */\${fileSize}\`);
      return res.status(416).json({ message: error.message, code: error.code });
    }

    sendErrorResponse(res, error, 'Failed to stream Google Drive video.');
  }
};
`;

if (!code.includes('streamGoogleDriveLesson')) {
  code = code.replace(
    "module.exports = {",
    additionalMethods + "\nmodule.exports = {"
  );
  
  code = code.replace(
    "extractYouTubeId,",
    "extractYouTubeId,\n  getFreeGoogleDriveLessons,\n  streamGoogleDriveLesson,"
  );
}

fs.writeFileSync(filePath, code);
console.log('Restored lessonController.js');
