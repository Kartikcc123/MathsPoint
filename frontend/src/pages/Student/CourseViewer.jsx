import React, { useMemo, useState, useContext, useCallback } from 'react';
import { PlayCircle, CheckCircle, FileText, ExternalLink, ChevronLeft, ChevronRight, Clock, Lock, BookOpen, X, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';
import SecureVideoPlayer from '../../components/Dashboard/SecureVideoPlayer';
import SecureDocumentViewer from '../../components/Dashboard/SecureDocumentViewer';

const CourseViewer = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [chapterTab, setChapterTab] = useState('Videos');
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [playingVideoMaterial, setPlayingVideoMaterial] = useState(null);

  useRefreshOnFocus(async () => {
    try {
      setLoadingMaterials(true);
      setLoadingLessons(true);

      const [dashboardRes, materialsRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/materials'),
      ]);

      setCourse(dashboardRes.data.course);
      setMaterials(materialsRes.data);
      setLoadingMaterials(false);

      // Fetch lessons if course exists
      if (dashboardRes.data.course?._id) {
        const [lessonsRes, progressRes] = await Promise.all([
          api.get(`/lessons/course/${dashboardRes.data.course._id}`),
          api.get(`/lessons/progress/${dashboardRes.data.course._id}`),
        ]);
        setLessons(lessonsRes.data);
        setCourseProgress(progressRes.data);
      }
    } catch (error) {
      console.error('Failed to load course viewer data', error);
    } finally {
      setLoadingMaterials(false);
      setLoadingLessons(false);
    }
  });

  const modules = useMemo(() => {
    const uniqueModules = [...new Set(lessons.map((item) => item.moduleTitle).filter(Boolean))];
    if (uniqueModules.length === 0 && lessons.length > 0) return [{ title: 'Lessons', lessons }];
    return uniqueModules.map((moduleName) => ({
      title: moduleName,
      lessons: lessons.filter((l) => l.moduleTitle === moduleName),
    }));
  }, [lessons]);

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex h-screen bg-white">
      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex h-16 items-center border-b border-slate-100 px-6 shrink-0 sticky top-0 bg-white z-10">
          <Link to="/student/courses" className="flex items-center gap-2 font-medium text-slate-500 transition hover:text-[#5a4bda]">
            <ChevronLeft className="h-5 w-5" /> Back to My Courses
          </Link>
        </div>

        <div className="max-w-6xl mx-auto w-full p-6 md:p-10 pb-32">
          {/* Course Title (Instead of Hero) */}
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-8">{course?.title || 'Loading Course...'}</h1>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 mb-8 gap-8">
            <button
              onClick={() => { setActiveTab('subjects'); setActiveSubject(null); }}
              className={`py-3 font-semibold text-[15px] transition relative text-[#5a4bda]`}
            >
              Subjects
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5a4bda] rounded-t-full" />
            </button>
          </div>

          {/* Subjects Tab - Grid View */}
          {activeTab === 'subjects' && !activeSubject && (
            <div className="space-y-8">
              {loadingLessons ? (
                 <div className="p-8 text-center text-slate-500">Loading subjects...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(() => {
                      const subjectList = course?.subjects?.length ? course.subjects : modules.map(m => m.title);
                      if (subjectList.length === 0) return <div className="col-span-full text-slate-500">No subjects found.</div>;
                      
                      return subjectList.map((subjectName, idx) => {
                        const firstChar = subjectName.substring(0, 1).toUpperCase();
                        const secondChar = subjectName.length > 1 ? subjectName.substring(1, 2).toLowerCase() : '';
                        
                        return (
                          <button 
                            key={idx}
                            onClick={() => setActiveSubject(subjectName)}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#5a4bda] hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-[#f0f4ff] text-[#4b84f3] flex items-center justify-center font-bold text-sm shrink-0">
                                {firstChar}{secondChar}
                              </div>
                              <span className="font-semibold text-slate-700 text-[15px] text-left line-clamp-1">{subjectName}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 pl-2">
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400">0%</span>
                                <div className="h-1.5 w-6 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full w-0 bg-[#5a4bda] rounded-full"></div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#5a4bda]" />
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <span>Completion % depends on lecture and DPP progress!</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subjects Tab - Chapters View (Tier 2) */}
          {activeTab === 'subjects' && activeSubject && !activeChapter && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
               <button 
                 onClick={() => setActiveSubject(null)}
                 className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#5a4bda] mb-6 transition-colors"
               >
                 <ChevronLeft className="h-4 w-4" /> Back to Subjects
               </button>
               <h2 className="text-xl font-bold text-slate-800 mb-6">{activeSubject} Chapters</h2>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {(() => {
                    const subjectLessons = lessons.filter(l => l.subject === activeSubject || !l.subject);
                    const subjectMaterials = materials.filter(m => m.subject === activeSubject || !m.subject);

                    const uniqueChapterNames = [...new Set([
                      ...subjectLessons.map(l => l.moduleTitle),
                      ...subjectMaterials.map(m => m.moduleName)
                    ])].filter(Boolean);
                    
                    if (uniqueChapterNames.length === 0) return <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">No chapters available for this subject yet.</div>;
                    
                    return uniqueChapterNames.map((chapterName, idx) => {
                      const match = chapterName.match(/^(CH\s*-\s*\d+)\s*(.*)/i);
                      const tag = match ? match[1].toUpperCase() : 'CH';
                      const name = match ? (match[2] || chapterName) : chapterName;
                      
                      const chapterLessonCount = subjectLessons.filter(l => l.moduleTitle === chapterName).length;

                      return (
                        <button
                          key={idx}
                          onClick={() => { setActiveChapter(chapterName); setChapterTab('Videos'); }}
                          className="flex flex-col p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#5a4bda] hover:shadow-md transition-all text-left group"
                        >
                          <div className="bg-[#f0f4ff] text-[#5a4bda] text-[11px] font-bold px-2.5 py-1 rounded w-fit mb-3">
                            {tag}
                          </div>
                          <h3 className="text-[17px] font-bold text-slate-800 mb-4 line-clamp-2">{name}</h3>
                          <div className="flex items-center justify-between mt-auto w-full">
                            <span className="text-sm text-slate-500">Lecture: <span className="font-bold text-slate-800">0/{chapterLessonCount}</span></span>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#5a4bda]" />
                          </div>
                        </button>
                      );
                    });
                 })()}
               </div>
             </div>
          )}

          {/* Chapter Detail View (Tier 3: Sidebar + Content) */}
          {activeTab === 'subjects' && activeSubject && activeChapter && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300 -mx-6 md:-mx-10 px-6 md:px-10 h-full">
              {/* Left Sidebar */}
              <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                <div className="mb-4">
                  <button 
                    onClick={() => setActiveChapter(null)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#5a4bda] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back to Chapters
                  </button>
                </div>
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">ALL CHAPTERS</h3>
                <div className="space-y-1 max-h-64 lg:max-h-none overflow-y-auto pr-2 no-scrollbar">
                  {(() => {
                    const subjectLessons = lessons.filter(l => l.subject === activeSubject || !l.subject);
                    const subjectMaterials = materials.filter(m => m.subject === activeSubject || !m.subject);

                    const uniqueChapterNames = [...new Set([
                      ...subjectLessons.map(l => l.moduleTitle),
                      ...subjectMaterials.map(m => m.moduleName)
                    ])].filter(Boolean);

                    return uniqueChapterNames.map((chapterName, idx) => {
                      const isActive = chapterName === activeChapter;
                      return (
                        <button
                          key={idx}
                          onClick={() => { setActiveChapter(chapterName); setChapterTab('Videos'); }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive ? 'bg-[#f0f4ff] text-[#5a4bda] border-l-[3px] border-[#5a4bda] shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {chapterName}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Inner Tabs */}
                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                  {['Videos', 'Notes', 'PYQs', 'Assignments'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setChapterTab(tab)}
                      className={`px-4 py-3 text-[14px] font-semibold whitespace-nowrap relative transition-colors ${chapterTab === tab ? 'text-[#5a4bda]' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {tab}
                      {chapterTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5a4bda] rounded-t-full" />}
                    </button>
                  ))}
                </div>

                {/* List Content */}
                <div className="space-y-4">
                  {(() => {
                    const chapterLessons = lessons.filter(l => l.moduleTitle === activeChapter);
                    const chapterMaterials = materials.filter(m => m.moduleName === activeChapter || m.moduleTitle === activeChapter);

                    let itemsToRender = [];
                    
                    if (chapterTab === 'Videos') {
                      itemsToRender = [
                        ...chapterLessons.map(l => ({...l, _type: 'lesson'})),
                        ...chapterMaterials.filter(m => m.type === 'Video').map(m => ({...m, _type: 'material'}))
                      ];
                    } else if (chapterTab === 'Notes') {
                      itemsToRender = chapterMaterials.filter(m => m.type === 'Notes').map(m => ({...m, _type: 'material'}));
                    } else if (chapterTab === 'PYQs') {
                      itemsToRender = chapterMaterials.filter(m => m.type === 'PYQ').map(m => ({...m, _type: 'material'}));
                    } else if (chapterTab === 'Assignments') {
                      itemsToRender = chapterMaterials.filter(m => m.type === 'Assignment' || m.type === 'Practice Set').map(m => ({...m, _type: 'material'}));
                    }
                    
                    if (itemsToRender.length === 0) {
                      return <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">No {chapterTab.toLowerCase()} found for this chapter.</div>;
                    }

                    return itemsToRender.map((item, i) => {
                      if (item._type === 'lesson') {
                        return (
                          <div key={`lesson-${item._id}`} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#5a4bda] transition-colors group">
                            <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden relative shrink-0">
                              <div className="absolute inset-0 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-black/20 transition-all">
                                <PlayCircle className="h-6 w-6" />
                              </div>
                              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1 rounded">
                                {formatDuration(item.duration) || '0:00'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                LECTURE • {new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}
                              </p>
                              <h4 className="font-semibold text-slate-800 text-[15px] truncate">{item.title}</h4>
                              <div className="mt-3 flex items-center gap-3">
                                <button 
                                  onClick={() => navigate(`/student/lesson/${item._id}`)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-[#5a4bda] bg-[#f0f4ff] px-3 py-1.5 rounded-full hover:bg-[#e0e8ff] transition-colors"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" /> View Lecture
                                </button>
                                {item.materials && item.materials.length > 0 && (
                                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <FileText className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 pl-2 hidden sm:block">
                              {item.completed ? (
                                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-[#5a4bda] transition-colors">
                                  <CheckCircle className="h-4 w-4 text-slate-300 group-hover:text-[#5a4bda] transition-colors" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={`material-${item._id}`} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#5a4bda] transition-colors group">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${item.type === 'Video' ? 'bg-red-50 text-red-500' : 'bg-rose-50 text-rose-500'}`}>
                              {item.type === 'Video' ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {item.type} • {new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}
                              </p>
                              <h4 className="font-semibold text-slate-800 text-[15px] truncate">{item.title}</h4>
                            </div>
                            <div className="shrink-0 pl-2">
                              {item.type === 'Video' ? (
                                <button 
                                  onClick={() => setPlayingVideoMaterial(item)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                                >
                                  <PlayCircle className="h-3 w-3" /> Play Video
                                </button>
                              ) : (
                                <button 
                                  onClick={() => navigate(`/student/material/${item._id}`)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                  View <FileText className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Video Modal Overlay */}
      {playingVideoMaterial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl animate-in fade-in zoom-in duration-300">
            <div className="absolute -top-12 right-0">
              <button 
                onClick={() => setPlayingVideoMaterial(null)}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Close <X className="h-4 w-4" />
              </button>
            </div>
            <SecureVideoPlayer 
              embedUrl={playingVideoMaterial.fileUrl} 
              lessonTitle={playingVideoMaterial.title}
              isLoading={false}
              onProgress={() => {}} // Not tracking progress for material videos currently
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseViewer;
