import React, { useMemo, useState } from 'react';
import { PlayCircle, CheckCircle, FileText, ExternalLink, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

const CourseViewer = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useRefreshOnFocus(async () => {
    try {
      setLoadingMaterials(true);
      const [dashboardRes, materialsRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/materials'),
      ]);
      setCourse(dashboardRes.data.course);
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error('Failed to load course viewer data', error);
    } finally {
      setLoadingMaterials(false);
    }
  });

  const modules = useMemo(() => {
    const uniqueModules = [...new Set(materials.map((item) => item.moduleName).filter(Boolean))];
    return uniqueModules.map((moduleName, index) => ({
      title: moduleName,
      duration: `${materials.filter((item) => item.moduleName === moduleName).length} item(s)`,
      active: index === 0,
      complete: false,
    }));
  }, [materials]);

  const featuredMaterial = materials[0] || null;

  return (
    <div className="relative flex h-full bg-white">
      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        <div className="flex h-16 items-center border-b border-slate-100 px-6 shrink-0">
          <Link to="/student/courses" className="flex items-center gap-2 font-medium text-slate-500 transition hover:text-blue-600">
            <ChevronLeft className="h-5 w-5" /> Back to My Courses
          </Link>
        </div>

        <div className="relative flex aspect-video w-full flex-col items-center justify-center bg-slate-950 shrink-0 text-center text-white">
          <div className="absolute left-6 top-6 text-sm font-semibold uppercase tracking-wider text-white/50">Course View</div>
          <PlayCircle className="h-20 w-20 text-white/30" />
          <p className="mt-4 text-lg font-medium">{course?.title || 'No assigned course'}</p>
          <p className="mt-2 text-sm text-white/70">{featuredMaterial?.title || 'Published materials will appear below'}</p>
        </div>

        <div className="flex border-b border-slate-200 px-8 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-semibold transition ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-4 font-semibold transition ${activeTab === 'resources' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Resources & Materials
          </button>
        </div>

        <div className="p-8 pb-32">
          {activeTab === 'overview' && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-800">About this Course</h2>
              <p className="max-w-3xl leading-relaxed text-slate-600">{course?.description || 'No course description is available yet.'}</p>
              {course?.subjects?.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {course.subjects.map((subject) => (
                    <span key={subject} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{subject}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-800">Published Materials</h2>
              <div className="max-w-2xl space-y-4">
                {!loadingMaterials && materials.length > 0 ? materials.map((material) => (
                  <div key={material._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{material.title}</p>
                        <p className="text-xs text-slate-500">{material.type} • {material.moduleName || 'General material'}</p>
                      </div>
                    </div>
                    <a href={material.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                    {loadingMaterials ? 'Loading materials...' : 'No published materials yet.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden h-full w-96 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50 lg:flex">
        <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-800">Course Structure</h3>
          <div className="mt-2 text-sm text-slate-500">
            {modules.length ? `${modules.length} module group(s)` : `${materials.length} published material item(s)`}
          </div>
        </div>

        <div className="space-y-2 p-4">
          {modules.length ? modules.map((mod, index) => (
            <div key={index} className={`flex gap-4 rounded-xl border p-4 transition ${mod.active ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
              <div className="mt-0.5 shrink-0">
                {mod.complete ? <CheckCircle className="h-5 w-5 text-green-500" /> : <div className={`h-5 w-5 rounded-full border-2 ${mod.active ? 'border-blue-500' : 'border-slate-300'}`}></div>}
              </div>
              <div>
                <p className={`text-sm font-semibold ${mod.active ? 'text-blue-700' : 'text-slate-700'}`}>{mod.title}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <PlayCircle className="h-3 w-3" /> {mod.duration}
                </p>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No module groups found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
