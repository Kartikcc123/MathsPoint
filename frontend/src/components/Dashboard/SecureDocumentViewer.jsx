import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, ExternalLink, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

const getFileExtension = (fileUrl = '') => {
  if (!fileUrl) return '';

  const cleanUrl = fileUrl.startsWith('local:') ? fileUrl.replace('local:', '') : fileUrl;
  const withoutQuery = cleanUrl.split('?')[0];
  const parts = withoutQuery.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getViewerType = (fileUrl = '') => {
  const ext = getFileExtension(fileUrl);

  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['doc', 'docx'].includes(ext)) return 'document';
  return 'unknown';
};

const SecureDocumentViewer = ({ materialId, fileUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  const viewerType = useMemo(() => getViewerType(fileUrl), [fileUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (materialId) {
      const token = localStorage.getItem('token');
      const base =
        import.meta.env.VITE_API_BASE_URL ||
        (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://mathspoint.onrender.com/api');

      setStreamUrl(`${base}/student/material/${materialId}/stream?token=${encodeURIComponent(token)}`);
      return;
    }

    if (fileUrl) {
      setStreamUrl(fileUrl);
      return;
    }

    setError('No document source provided.');
    setLoading(false);
  }, [materialId, fileUrl]);

  useEffect(() => {
    if (!streamUrl) return;
    if (viewerType === 'document' || viewerType === 'unknown') {
      setLoading(false);
    }
  }, [streamUrl, viewerType]);

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 px-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-400" />
        <h3 className="mb-2 text-lg font-bold text-white">Failed to load document</h3>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-900">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-sky-400" />
          <p className="text-sm font-medium text-slate-400">Loading document...</p>
        </div>
      )}

      {streamUrl && viewerType === 'pdf' && (
        <iframe
          src={streamUrl}
          title={title || 'Document viewer'}
          className={`h-full w-full border-0 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
        />
      )}

      {streamUrl && viewerType === 'image' && (
        <div className="flex h-full w-full items-center justify-center bg-slate-950 p-6">
          <img
            src={streamUrl}
            alt={title || 'Uploaded material'}
            className={`max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Image could not be loaded. Please try again.');
            }}
          />
        </div>
      )}

      {streamUrl && viewerType === 'document' && (
        <div className="flex h-full w-full items-center justify-center bg-slate-950 p-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Preview not available for Word files</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              This material was uploaded as a Word document. Open it in a new tab or download it to view the file correctly.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                <ExternalLink className="h-4 w-4" />
                Open File
              </a>
              <a
                href={streamUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {streamUrl && viewerType === 'unknown' && (
        <div className="flex h-full w-full items-center justify-center bg-slate-950 p-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
              <ImageIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Preview unavailable</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              This file type cannot be previewed inside the student panel yet. Open it in a new tab to access the uploaded material.
            </p>
            <div className="mt-6">
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                <ExternalLink className="h-4 w-4" />
                Open File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureDocumentViewer;
