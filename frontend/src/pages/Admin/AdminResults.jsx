import React, { useRef, useState } from 'react';
import { FileText, Trophy, UploadCloud, LoaderCircle } from 'lucide-react';
import api from '../../services/api';

const AdminResults = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [createdIds, setCreatedIds] = useState([]);

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setMessage('Please upload a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setMessage('Uploading and building preview...');
      // preview mode
      const res = await api.post('/admin/results/upload?mode=preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviewRows(res.data.parsedRows || []);
      setMessage(`Preview parsed ${res.data.count || 0} rows.`);
      setCreatedIds([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload/preview failed.');
      setPreviewRows([]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateDrafts = async () => {
    if (!previewRows.length) return setMessage('No preview rows to create.');
    try {
      setUploading(true);
      setMessage('Creating draft results...');
      const res = await api.post('/admin/results/create', { rows: previewRows });
      setMessage(res.data?.message || 'Created drafts.');
      setCreatedIds(res.data.createdIds || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Create drafts failed.');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!createdIds.length) return setMessage('No created drafts to publish.');
    try {
      setUploading(true);
      setMessage('Publishing results...');
      const res = await api.patch('/admin/results/publish', { ids: createdIds });
      setMessage(res.data?.message || 'Published results.');
      // clear previews and created ids
      setPreviewRows([]);
      setCreatedIds([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Publish failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <FileText className="h-6 w-6 text-orange-600" /> Test Results Hub
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Upload mock test metrics and calculate percentiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
          <button onClick={openFileDialog} disabled={uploading} className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60">
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />} Publish New Result
          </button>
        </div>
      </header>

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <Trophy className="h-10 w-10" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-800">No Active Tests</h3>
        <p className="mx-auto mb-8 max-w-md text-slate-500">
          There are no recently published results for the active batches. Click publish to upload a CSV score sheet.
        </p>
        {message && <div className="mt-4 rounded-md bg-slate-50 px-4 py-2 text-sm text-slate-700">{message}</div>}
        {previewRows.length > 0 && (
          <div className="mt-6 w-full rounded-lg border border-slate-100 bg-white p-4 text-left">
            <h4 className="mb-2 font-semibold">Preview Rows ({previewRows.length})</h4>
            <div className="max-h-60 overflow-auto text-sm">
              <table className="w-full text-left">
                <thead className="text-slate-500 text-xs">
                  <tr><th className="px-2">Student ID</th><th className="px-2">Student</th><th className="px-2">Exam</th><th className="px-2">Marks</th></tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-2 py-1 text-xs">{r.studentIdValue}</td>
                      <td className="px-2 py-1 text-xs">{r.studentName || 'Unknown'}</td>
                      <td className="px-2 py-1 text-xs">{r.examName}</td>
                      <td className="px-2 py-1 text-xs">{r.marksObtained}/{r.totalMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={handleCreateDrafts} disabled={uploading} className="rounded-2xl bg-blue-600 px-4 py-2 text-white">Create Drafts</button>
              <button onClick={() => { setPreviewRows([]); setMessage('Preview cleared'); }} className="rounded-2xl border px-4 py-2">Cancel</button>
              {createdIds.length > 0 && (
                <button onClick={handlePublish} disabled={uploading} className="ml-auto rounded-2xl bg-emerald-600 px-4 py-2 text-white">Publish Created</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
