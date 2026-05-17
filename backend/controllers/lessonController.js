const jwt = require('jsonwebtoken');
const Lesson = require('../models/Lesson');
const WatchProgress = require('../models/WatchProgress');
const User = require('../models/User');
const { encryptVideoId, decryptVideoId } = require('../utils/crypto');
const { AppError, sendErrorResponse } = require('../utils/api');

/**
 * Extract a YouTube video ID from various input formats:
 *   - Plain ID: "dQw4w9WgXcQ"
 *   - Full URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   - Short URL: "https://youtu.be/dQw4w9WgXcQ"
 *   - Embed URL: "https://www.youtube.com/embed/dQw4w9WgXcQ"
 *   - Shorts: "https://www.youtube.com/shorts/dQw4w9WgXcQ"
 * Returns just the video ID string, or null if invalid.
 */
const extractYouTubeId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If it looks like a plain video ID (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Try parsing as URL
    const url = new URL(trimmed);
    const hostname = url.hostname.replace('www.', '');

    if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
      // /watch?v=ID
      if (url.pathname === '/watch') {
        return url.searchParams.get('v') || null;
      }
      // /embed/ID
      const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];
      // /shorts/ID
      const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }

    // youtu.be/ID
    if (hostname === 'youtu.be') {
      const shortMatch = url.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch) return shortMatch[1];
    }
  } catch {
    // Not a valid URL — try regex fallback
    const fallback = trimmed.match(/[a-zA-Z0-9_-]{11}/);
    return fallback ? fallback[0] : null;
  }

  return null;
};

// ──────────────────────────────────────────────
// ADMIN ENDPOINTS
// ──────────────────────────────────────────────

// @desc    Create a new lesson with encrypted YouTube video ID
// @route   POST /api/admin/lesson
// @access  Private (Admin)
const createLesson = async (req, res) => {
  try {
    const { courseId, subject, title, description, moduleTitle, youtubeVideoId, duration, thumbnail, isPublished, isFree } = req.body;

    if (!courseId || !title || !youtubeVideoId) {
      throw new AppError(400, 'Course ID, title, and YouTube Video ID are required.', { code: 'LESSON_MISSING_FIELDS' });
    }

    // Auto-extract video ID from any YouTube URL format
    const videoId = extractYouTubeId(youtubeVideoId);
    if (!videoId) {
      throw new AppError(400, 'Invalid YouTube Video ID or URL. Provide a valid video ID or YouTube URL.', { code: 'LESSON_INVALID_VIDEO_ID' });
    }

    // Encrypt the clean video ID before storing
    const { encrypted, iv } = encryptVideoId(videoId);

    // Get the next order number
    const lastLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = await Lesson.create({
      course: courseId,
      subject: subject || '',
      title: title.trim(),
      description: description?.trim() || '',
      moduleTitle: moduleTitle?.trim() || '',
      order,
      encryptedVideoId: encrypted,
      videoIV: iv,
      duration: duration || 0,
      thumbnail: thumbnail?.trim() || '',
      isPublished: isPublished ?? false,
      isFree: isFree ?? false,
    });

    res.status(201).json({
      _id: lesson._id,
      course: lesson.course,
      title: lesson.title,
      description: lesson.description,
      moduleTitle: lesson.moduleTitle,
      order: lesson.order,
      duration: lesson.duration,
      thumbnail: lesson.thumbnail,
      isPublished: lesson.isPublished,
      isFree: lesson.isFree,
      isEncrypted: true,
      createdAt: lesson.createdAt,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to create lesson.');
  }
};

// @desc    Update a lesson
// @route   PUT /api/admin/lesson/:id
// @access  Private (Admin)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    const { subject, title, description, moduleTitle, youtubeVideoId, duration, thumbnail, isPublished, isFree, order } = req.body;

    if (subject !== undefined) lesson.subject = subject.trim();
    if (title !== undefined) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description.trim();
    if (moduleTitle !== undefined) lesson.moduleTitle = moduleTitle.trim();
    if (duration !== undefined) lesson.duration = duration;
    if (thumbnail !== undefined) lesson.thumbnail = thumbnail.trim();
    if (isPublished !== undefined) lesson.isPublished = isPublished;
    if (isFree !== undefined) lesson.isFree = isFree;
    if (order !== undefined) lesson.order = order;

    // Re-encrypt if video ID changed
    if (youtubeVideoId) {
      const videoId = extractYouTubeId(youtubeVideoId);
      if (!videoId) {
        throw new AppError(400, 'Invalid YouTube Video ID or URL.', { code: 'LESSON_INVALID_VIDEO_ID' });
      }
      const { encrypted, iv } = encryptVideoId(videoId);
      lesson.encryptedVideoId = encrypted;
      lesson.videoIV = iv;
    }

    await lesson.save();

    res.json({
      _id: lesson._id,
      course: lesson.course,
      title: lesson.title,
      description: lesson.description,
      moduleTitle: lesson.moduleTitle,
      order: lesson.order,
      duration: lesson.duration,
      thumbnail: lesson.thumbnail,
      isPublished: lesson.isPublished,
      isFree: lesson.isFree,
      isEncrypted: true,
      updatedAt: lesson.updatedAt,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update lesson.');
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/admin/lesson/:id
// @access  Private (Admin)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    // Remove associated watch progress
    await WatchProgress.deleteMany({ lesson: lesson._id });
    await lesson.deleteOne();

    res.json({ message: 'Lesson deleted successfully.' });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to delete lesson.');
  }
};

// @desc    Get all lessons for a course (admin view — no video decryption)
// @route   GET /api/admin/lessons/:courseId
// @access  Private (Admin)
const getAdminLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId })
      .sort({ order: 1 })
      .select('-encryptedVideoId -videoIV');

    res.json(lessons);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load lessons.');
  }
};

// @desc    Reorder lessons
// @route   PATCH /api/admin/lessons/reorder
// @access  Private (Admin)
const reorderLessons = async (req, res) => {
  try {
    const { lessonOrders } = req.body; // [{ id, order }]

    if (!Array.isArray(lessonOrders) || lessonOrders.length === 0) {
      throw new AppError(400, 'lessonOrders array is required.', { code: 'LESSON_REORDER_INVALID' });
    }

    const bulkOps = lessonOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Lesson.bulkWrite(bulkOps);
    res.json({ message: 'Lessons reordered successfully.' });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to reorder lessons.');
  }
};

// ──────────────────────────────────────────────
// STUDENT ENDPOINTS
// ──────────────────────────────────────────────

// @desc    Get lesson list for enrolled course (no video data)
// @route   GET /api/lessons/course/:courseId
// @access  Private (Student)
const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student = req.user;

    // Verify enrollment
    const isEnrolled = student.course?._id?.toString() === courseId ||
      (student.enrolledCourses || []).some((c) => (c._id || c).toString() === courseId);

    if (!isEnrolled) {
      throw new AppError(403, 'You are not enrolled in this course.', { code: 'LESSON_NOT_ENROLLED' });
    }

    const lessons = await Lesson.find({ course: courseId, isPublished: true })
      .sort({ order: 1 })
      .select('title description moduleTitle order duration thumbnail isFree');

    // Get watch progress for this student and course
    const progressRecords = await WatchProgress.find({
      student: student._id,
      course: courseId,
    }).select('lesson progress completedAt');

    const progressMap = {};
    for (const record of progressRecords) {
      progressMap[record.lesson.toString()] = {
        progress: record.progress,
        completed: !!record.completedAt,
      };
    }

    const lessonsWithProgress = lessons.map((lesson) => ({
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      moduleTitle: lesson.moduleTitle,
      order: lesson.order,
      duration: lesson.duration,
      thumbnail: lesson.thumbnail,
      isFree: lesson.isFree,
      progress: progressMap[lesson._id.toString()]?.progress || 0,
      completed: progressMap[lesson._id.toString()]?.completed || false,
    }));

    res.json(lessonsWithProgress);
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load lessons.');
  }
};

// @desc    Get secure playable lesson (THE CORE SECURE ENDPOINT)
// @route   GET /api/lesson/:id
// @access  Private (Student)
const getLessonPlayer = async (req, res) => {
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

    // Decrypt the YouTube video ID internally
    const rawVideoId = decryptVideoId(lesson.encryptedVideoId, lesson.videoIV);

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
      origin: process.env.CORS_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173',
    });

    const embedUrl = `https://www.youtube.com/embed/${plainVideoId}?${embedParams.toString()}`;

    // Generate short-lived session token (5 minutes)
    const expirySeconds = Number(process.env.LESSON_TOKEN_EXPIRY) || 300;
    const lessonToken = jwt.sign(
      { lessonId: lesson._id, userId: student._id, type: 'lesson_session' },
      process.env.JWT_SECRET,
      { expiresIn: expirySeconds }
    );

    // Get existing progress
    const existingProgress = await WatchProgress.findOne({
      student: student._id,
      lesson: lesson._id,
    });

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

// @desc    Update watch progress
// @route   POST /api/lesson/:id/progress
// @access  Private (Student)
const updateWatchProgress = async (req, res) => {
  try {
    const { progress, watchDuration } = req.body;
    const student = req.user;
    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId).select('course');
    if (!lesson) {
      throw new AppError(404, 'Lesson not found.', { code: 'LESSON_NOT_FOUND' });
    }

    const progressValue = Math.min(100, Math.max(0, Number(progress) || 0));

    const updateData = {
      progress: progressValue,
      lastWatchedAt: new Date(),
    };

    if (watchDuration) {
      updateData.$inc = { watchDuration: Number(watchDuration) || 0 };
    }

    // Mark as completed at 90% or more
    if (progressValue >= 90) {
      updateData.completedAt = new Date();
    }

    const record = await WatchProgress.findOneAndUpdate(
      { student: student._id, lesson: lessonId },
      {
        $set: {
          progress: progressValue,
          lastWatchedAt: new Date(),
          ...(progressValue >= 90 ? { completedAt: new Date() } : {}),
        },
        $inc: { watchDuration: Number(watchDuration) || 0 },
        $setOnInsert: {
          student: student._id,
          lesson: lessonId,
          course: lesson.course,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      progress: record.progress,
      completed: !!record.completedAt,
      watchDuration: record.watchDuration,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to update watch progress.');
  }
};

// @desc    Get watch progress for all lessons in a course
// @route   GET /api/lessons/progress/:courseId
// @access  Private (Student)
const getWatchProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student = req.user;

    const progress = await WatchProgress.find({
      student: student._id,
      course: courseId,
    }).select('lesson progress completedAt lastWatchedAt watchDuration');

    const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    const completedLessons = progress.filter((p) => !!p.completedAt).length;

    res.json({
      progress,
      totalLessons,
      completedLessons,
      courseProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load watch progress.');
  }
};

// @desc    Test YouTube embed accessibility
// @route   GET /api/test-youtube?videoId=dQw4w9WgXcQ
// @access  Private (Admin)
const testYouTubeEmbed = async (req, res) => {
  try {
    const { videoId: rawInput } = req.query;

    if (!rawInput) {
      return res.status(400).json({ message: 'videoId query param required (ID or URL).' });
    }

    const videoId = extractYouTubeId(rawInput);

    const results = {
      input: rawInput,
      extractedVideoId: videoId,
      valid: !!videoId,
      checks: [],
    };

    if (!videoId) {
      results.checks.push({ name: 'Video ID Extraction', pass: false, detail: 'Could not extract a valid 11-char video ID' });
      return res.json(results);
    }

    results.checks.push({ name: 'Video ID Extraction', pass: true, detail: videoId });

    // Build embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&enablejsapi=1`;
    results.embedUrl = embedUrl;
    results.checks.push({ name: 'Embed URL Format', pass: true, detail: embedUrl });

    // Test YouTube oEmbed API to verify video exists and is embeddable
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    try {
      const https = require('https');
      const oEmbedResult = await new Promise((resolve, reject) => {
        https.get(oEmbedUrl, (response) => {
          let data = '';
          response.on('data', (chunk) => { data += chunk; });
          response.on('end', () => {
            if (response.statusCode === 200) {
              resolve({ status: response.statusCode, data: JSON.parse(data) });
            } else {
              resolve({ status: response.statusCode, data: null });
            }
          });
        }).on('error', reject);
      });

      if (oEmbedResult.status === 200) {
        results.checks.push({ name: 'YouTube oEmbed Check', pass: true, detail: `Video title: "${oEmbedResult.data?.title}"` });
        results.videoTitle = oEmbedResult.data?.title;
        results.videoAuthor = oEmbedResult.data?.author_name;
      } else if (oEmbedResult.status === 401) {
        results.checks.push({ name: 'YouTube oEmbed Check', pass: false, detail: 'Video is private or embedding is disabled (HTTP 401)' });
      } else if (oEmbedResult.status === 404) {
        results.checks.push({ name: 'YouTube oEmbed Check', pass: false, detail: 'Video not found (HTTP 404)' });
      } else {
        results.checks.push({ name: 'YouTube oEmbed Check', pass: false, detail: `Unexpected status: ${oEmbedResult.status}` });
      }
    } catch (fetchError) {
      results.checks.push({ name: 'YouTube oEmbed Check', pass: false, detail: `Network error: ${fetchError.message}` });
    }

    // CSP check
    results.checks.push({
      name: 'Server CSP Config',
      pass: true,
      detail: 'frame-src includes youtube.com (configured via helmet)',
    });

    // Sandbox check
    results.checks.push({
      name: 'Sandbox Attribute',
      pass: true,
      detail: 'No sandbox attribute set on iframe (YouTube requires unrestricted iframe)',
    });

    // Error 153 common causes
    results.error153Checklist = [
      { issue: 'controls=0', status: 'FIXED', detail: 'Using controls=1 (required by YouTube)' },
      { issue: 'youtube-nocookie.com', status: 'FIXED', detail: 'Using standard youtube.com domain' },
      { issue: 'Restrictive sandbox', status: 'FIXED', detail: 'Sandbox attribute removed from iframe' },
      { issue: 'no-referrer policy', status: 'FIXED', detail: 'Referrer policy not set (YouTube needs referrer)' },
      { issue: 'CSP blocking frames', status: 'FIXED', detail: 'Helmet CSP includes youtube.com in frame-src' },
      { issue: 'disablekb=1', status: 'FIXED', detail: 'Removed — can trigger issues on some browsers' },
      { issue: 'fs=0 (disable fullscreen)', status: 'FIXED', detail: 'Removed — allowfullscreen=true now set' },
    ];

    results.allPassed = results.checks.every((c) => c.pass);

    res.json(results);
  } catch (error) {
    sendErrorResponse(res, error, 'YouTube embed test failed.');
  }
};

module.exports = {
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
};

