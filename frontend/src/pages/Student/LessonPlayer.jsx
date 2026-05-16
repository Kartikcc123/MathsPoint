import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import SecureVideoPlayer from '../../components/Dashboard/SecureVideoPlayer';
import DynamicWatermark from '../../components/Dashboard/DynamicWatermark';
import { generateDeviceId } from '../../utils/DeviceFingerprint';
import api from '../../services/api';

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [lesson, setLesson] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [watermark, setWatermark] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const progressSaveRef = useRef(null);
  const lessonDurationRef = useRef(0);

  // Get device fingerprint
  useEffect(() => {
    generateDeviceId().then(setDeviceId);
  }, []);

  // Fetch secure lesson data
  const fetchLesson = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setEmbedUrl('');

      const res = await api.get(`/lesson/${id}`);
      const data = res.data;

      setLesson(data.lesson);
      setEmbedUrl(data.embedUrl);
      setWatermark(data.watermark);
      setCurrentProgress(data.progress || 0);
      lessonDurationRef.current = data.lesson.duration || 0;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load lesson';
      setError(msg);
      console.error('Lesson fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all lessons for the sidebar
  const fetchCourseLessons = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get(`/lessons/course/${courseId}`),
        api.get(`/lessons/progress/${courseId}`),
      ]);
      setLessons(lessonsRes.data);
      setCourseProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to load course lessons:', err);
    }
  }, []);

  useEffect(() => {
    fetchLesson(lessonId);
  }, [lessonId, fetchLesson]);

  useEffect(() => {
    if (lesson?.course) {
      fetchCourseLessons(lesson.course);
    }
  }, [lesson?.course, fetchCourseLessons]);

  // Save progress handler
  const handleProgress = useCallback((elapsedSeconds) => {
    if (!lessonDurationRef.current || lessonDurationRef.current === 0) return;
    const progress = Math.min(100, Math.round((elapsedSeconds / lessonDurationRef.current) * 100));
    setCurrentProgress(progress);

    // Debounced save
    if (progressSaveRef.current) clearTimeout(progressSaveRef.current);
    progressSaveRef.current = setTimeout(async () => {
      try {
        await api.post(`/lesson/${lessonId}/progress`, {
          progress,
          watchDuration: 30,
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }, 2000);
  }, [lessonId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressSaveRef.current) clearTimeout(progressSaveRef.current);
    };
  }, []);

  // Group lessons by module
  const groupedLessons = lessons.reduce((acc, l) => {
    const module = l.moduleTitle || 'Lessons';
    if (!acc[module]) acc[module] = [];
    acc[module].push(l);
    return acc;
  }, {});

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full bg-slate-950 text-white">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-3 shrink-0 bg-slate-900/50 backdrop-blur-sm">
          <Link
            to="/student/courses"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-sky-400"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Courses
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white lg:hidden"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Lessons
          </button>

          {lesson?.moduleTitle && (
            <span className="hidden lg:block text-xs font-medium text-sky-400/70 uppercase tracking-wider">
              {lesson.moduleTitle}
            </span>
          )}
        </div>

        {/* Video player area */}
        <div className="relative w-full shrink-0">
          {error ? (
            <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
              <div className="text-center px-6">
                <Lock className="h-12 w-12 text-red-400/60 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
                <p className="text-sm text-slate-400 max-w-md">{error}</p>
                <Link
                  to="/student/courses"
                  className="inline-block mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Go to Courses
                </Link>
              </div>
            </div>
          ) : (
            <>
              <SecureVideoPlayer
                embedUrl={embedUrl}
                lessonTitle={lesson?.title}
                onProgress={handleProgress}
                isLoading={loading}
              />
              {/* Watermark overlay */}
              {watermark && !loading && (
                <DynamicWatermark
                  name={watermark.name}
                  email={watermark.email}
                  timestamp={watermark.timestamp}
                  deviceId={deviceId}
                />
              )}
            </>
          )}
        </div>

        {/* Lesson info */}
        <div className="p-6 lg:p-8 space-y-6">
          {lesson && (
            <>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-slate-400 leading-relaxed max-w-3xl">
                    {lesson.description}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="max-w-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-sky-400">
                    {currentProgress}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              {/* Lesson meta */}
              <div className="flex flex-wrap gap-4">
                {lesson.duration > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 border border-slate-700/30 px-3 py-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">
                      {formatDuration(lesson.duration)}
                    </span>
                  </div>
                )}
                {lesson.moduleTitle && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 border border-slate-700/30 px-3 py-2">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{lesson.moduleTitle}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Course Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 top-0 z-40 h-full w-80 lg:w-96 lg:relative lg:translate-x-0 flex flex-col border-l border-slate-800/60 bg-slate-900/95 backdrop-blur-md transition-transform duration-300`}
      >
        {/* Sidebar header */}
        <div className="shrink-0 border-b border-slate-800/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Course Content</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Course progress summary */}
          {courseProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">
                  {courseProgress.completedLessons}/{courseProgress.totalLessons} lessons
                </span>
                <span className="font-bold text-sky-400">
                  {courseProgress.courseProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${courseProgress.courseProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.entries(groupedLessons).map(([moduleName, moduleLessons]) => (
            <ModuleGroup
              key={moduleName}
              title={moduleName}
              lessons={moduleLessons}
              currentLessonId={lessonId}
              navigate={navigate}
              formatDuration={formatDuration}
            />
          ))}

          {lessons.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed border-slate-700/50 p-6 text-center text-sm text-slate-500">
              No lessons available yet.
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Module group component for sidebar
 */
const ModuleGroup = ({ title, lessons, currentLessonId, navigate, formatDuration }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:bg-slate-800/50 hover:text-slate-300"
      >
        <span className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5" />
          {title}
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="mt-1 space-y-1">
          {lessons.map((l) => {
            const isCurrent = l._id === currentLessonId;
            return (
              <button
                key={l._id}
                onClick={() => navigate(`/student/lesson/${l._id}`)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                  isCurrent
                    ? 'bg-sky-500/15 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                    : 'border border-transparent hover:bg-slate-800/50 hover:border-slate-700/30'
                }`}
              >
                <div className="shrink-0">
                  {l.completed ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <PlayCircle className="h-5 w-5 text-sky-400" />
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    </div>
                  ) : (
                    <PlayCircle className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-sky-300' : l.completed ? 'text-slate-400' : 'text-slate-300'
                    }`}
                  >
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {l.duration > 0 && (
                      <span className="text-[11px] text-slate-600">
                        {formatDuration(l.duration)}
                      </span>
                    )}
                    {l.progress > 0 && !l.completed && (
                      <span className="text-[11px] text-sky-500/70 font-medium">
                        {l.progress}%
                      </span>
                    )}
                    {l.isFree && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        FREE
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
