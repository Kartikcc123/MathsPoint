import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, TrendingUp, Target, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Results = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setResults(res.data.results || []);
      } catch (error) {
        console.error('Failed to load results', error);
      }
    };

    loadData();
  }, []);

  const chartData = useMemo(() => (
    results.slice().reverse().map((result) => ({
      name: result.examName,
      percentage: Math.round((result.marksObtained / result.totalMarks) * 100),
    }))
  ), [results]);

  const bestResult = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((best, current) => {
      const currentPct = current.marksObtained / current.totalMarks;
      const bestPct = best.marksObtained / best.totalMarks;
      return currentPct > bestPct ? current : best;
    });
  }, [results]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Performance & Results</h1>
        <p className="mt-1 text-slate-500">Only saved result records are shown here now.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Best Exam</p>
            <h3 className="text-xl font-bold text-slate-800">{bestResult?.examName || 'No exams yet'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-800">{results.length ? `${Math.round(results.reduce((sum, item) => sum + ((item.marksObtained / item.totalMarks) * 100), 0) / results.length)}%` : '0%'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Target className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Best Subject</p>
            <h3 className="text-2xl font-bold text-slate-800">{bestResult?.subject || 'Not available'}</h3>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800">Score Progression</h3>
        <div className="h-80 w-full">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Percentage" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">No results have been recorded yet.</div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Saved Result Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Exam</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Marks</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">Report</th>
              </tr>
            </thead>
            <tbody>
              {results.length ? results.map((result) => (
                <tr key={result._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{result.examName}</p>
                    <p className="text-xs text-slate-500">{result.remarks || 'No remarks'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{result.subject}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{result.marksObtained}/{result.totalMarks}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(result.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {result.reportCardUrl ? (
                      <a href={result.reportCardUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:text-blue-800">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-slate-300">Not uploaded</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center text-slate-500">No result records available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;
