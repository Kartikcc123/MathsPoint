import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  FileText,
  Clock,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Share2,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import SecureDocumentViewer from '../../components/Dashboard/SecureDocumentViewer';
import api from '../../services/api';

const MaterialPlayer = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [material, setMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterial = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/student/material/${id}`);
      setMaterial(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load material');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseMaterials = useCallback(async () => {
    try {
      const res = await api.get('/student/materials');
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  }, []);

  useEffect(() => {
    fetchMaterial(materialId);
  }, [materialId, fetchMaterial]);

  useEffect(() => {
    fetchCourseMaterials();
  }, [fetchCourseMaterials]);

  // Group materials by module
  const groupedMaterials = materials.reduce((acc, m) => {
    const module = m.moduleName || 'General Resources';
    if (!acc[module]) acc[module] = [];
    acc[module].push(m);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-slate-950 bg-[radial-gradient(circle_at_top_right,rgba(90,75,218,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] text-white overflow-hidden">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar - Dedicated Panel feel */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-3 shrink-0 bg-slate-950/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-sky-400"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {material?.title || 'Loading...'}
              </h1>
              {material?.course?.title && (
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  {material.course.title}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Redirect button removed for piracy protection */}
          </div>
        </div>

        {/* Viewer area */}
        <div className="relative flex-1 bg-slate-900/40 overflow-hidden">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-6">
                <Lock className="h-12 w-12 text-red-400/60 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
                <p className="text-sm text-slate-400 max-w-md">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-block mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full w-full">
               <SecureDocumentViewer 
                materialId={materialId}
                fileUrl={material?.fileUrl}
                title={material?.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialPlayer;
