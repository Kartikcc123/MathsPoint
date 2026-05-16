import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, ChevronRight, Trophy, BarChart3, Target } from 'lucide-react';
import api from '../../services/api';

const TestSeries = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | upcoming | completed

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/test-series');
        setTests(res.data || []);
      } catch (err) {
        console.error('Failed to load test series:', err);
        // Use empty array as fallback
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  const now = new Date();
  const filteredTests = tests.filter((t) => {
    if (filter === 'upcoming') return new Date(t.date) > now && !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tests.filter((t) => t.completed).length;
  const upcomingCount = tests.filter((t) => new Date(t.date) > now && !t.completed).length;
  const avgScore = tests.filter(t => t.completed && t.totalMarks).length > 0
    ? Math.round(
        tests
          .filter(t => t.completed && t.totalMarks)
          .reduce((sum, t) => sum + (t.marksObtained / t.totalMarks) * 100, 0) /
        tests.filter(t => t.completed && t.totalMarks).length
      )
    : 0;

  const filters = [
    { key: 'all', label: 'All Tests', count: tests.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-20">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Test Series</h1>
        <p className="mt-1 text-sm text-slate-500">Track your test performance and upcoming assessments</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{tests.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total Tests</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
            <p className="text-xs text-slate-500 font-medium">Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{avgScore}%</p>
            <p className="text-xs text-slate-500 font-medium">Average Score</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-white rounded-xl border border-slate-200 p-1.5 w-fit shadow-sm">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-indigo-200' : 'text-slate-400'}`}>
              ({f.count})
            </span>
          </button>
        ))}
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-slate-500">Loading test series...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No tests found</h3>
            <p className="text-sm text-slate-500">
              {filter === 'all'
                ? 'No test series have been assigned to you yet.'
                : filter === 'upcoming'
                ? 'You have no upcoming tests at the moment.'
                : 'You haven\'t completed any tests yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTests.map((test) => {
              const testDate = new Date(test.date);
              const isUpcoming = testDate > now && !test.completed;
              const isPast = testDate <= now && !test.completed;
              const pct = test.totalMarks ? Math.round((test.marksObtained / test.totalMarks) * 100) : null;

              return (
                <div
                  key={test._id}
                  className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    test.completed
                      ? 'bg-emerald-50 text-emerald-600'
                      : isUpcoming
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {test.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isUpcoming ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-800 truncate">{test.title || test.examName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{test.subject || 'General'}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{testDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {test.duration && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{test.duration} min</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score / Status Badge */}
                  <div className="shrink-0 text-right">
                    {test.completed && pct !== null ? (
                      <div>
                        <p className={`text-lg font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                          {pct}%
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">{test.marksObtained}/{test.totalMarks}</p>
                      </div>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Clock className="h-3 w-3" /> Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="h-3 w-3" /> Missed
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeries;
