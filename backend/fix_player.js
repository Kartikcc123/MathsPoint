const fs = require('fs');

const file = 'e:/Maths/backend/controllers/lessonController.js';
let code = fs.readFileSync(file, 'utf8');

// Ensure we have everything before getLessonPlayer
const beforeGetLessonPlayer = code.substring(0, code.indexOf('const updateWatchProgress = async (req, res) => {'));

// Create the correct getLessonPlayer function
const correctGetLessonPlayer = \`
// @desc    Get secure playable lesson (THE CORE SECURE ENDPOINT)
// @route   GET /api/lesson/:id
// @access  Private (Student)
const getLessonPlayer = async (req, res) => {
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
        streamUrl: \\\`/api/videos/\\\${lesson._id}/stream\\\`,
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

    // Decrypt the YouTube video ID internally
    let rawVideoId;
    try {
      rawVideoId = decryptVideoId(lesson.encryptedVideoId, lesson.videoIV);
    } catch (decryptError) {
      throw new AppError(400, 'This website lesson has invalid encrypted YouTube video data.', {
        code: 'YOUTUBE_VIDEO_CONFIG_INVALID',
        details: { providerMessage: decryptError.message },
      });
    }

    // Auto-extract video ID from various YouTube URL formats
    const plainVideoId = extractYouTubeId(rawVideoId);

    if (!plainVideoId) {
      throw new AppError(500, 'Invalid video configuration.', { code: 'LESSON_INVALID_VIDEO' });
    }

    // Build the embed URL — use standard youtube.com (nocookie can trigger 153)
    // IMPORTANT: controls=1 is REQUIRED — controls=0 causes Error 153
    const embedParams = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      playsinline: '1',
      enablejsapi: '1',
      origin:
        process.env.CORS_ORIGIN?.split(',')[0]?.trim() ||
        'https://mathspoint.co.in',
    });

    const embedUrl = \\\`https://www.youtube.com/embed/\\\${plainVideoId}?\\\${embedParams.toString()}\\\`;

    // Generate short-lived session token (5 minutes)
    const expirySeconds = Number(process.env.LESSON_TOKEN_EXPIRY) || 300;
    const lessonToken = jwt.sign(
      { lessonId: lesson._id, userId: student._id, type: 'lesson_session' },
      process.env.JWT_SECRET,
      { expiresIn: expirySeconds }
    );

    res.json({
      embedUrl,
      lessonToken,
      tokenExpiresIn: expirySeconds,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        moduleTitle: lesson.moduleTitle,
        duration: lesson.duration,
        course: lesson.course,
      },
      watermark: {
        name: student.name,
        email: student.email,
        timestamp: new Date().toISOString(),
      },
      progress: existingProgress?.progress || 0,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load lesson player.');
  }
};
\`

const afterGetLessonPlayer = code.substring(code.indexOf('const updateWatchProgress = async (req, res) => {'));

const finalCode = beforeGetLessonPlayer + correctGetLessonPlayer + '\\n// @desc    Update watch progress\\n// @route   POST /api/lesson/:id/progress\\n// @access  Private (Student)\\n' + afterGetLessonPlayer;

fs.writeFileSync(file, finalCode);
console.log('Restored getLessonPlayer correctly!');
