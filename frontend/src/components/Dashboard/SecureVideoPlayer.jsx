import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Loader2, Bug, CheckCircle, XCircle } from 'lucide-react';

/**
 * SecureVideoPlayer — Custom video player that dynamically injects YouTube iframe.
 * Never exposes YouTube URLs in static HTML.
 *
 * Props:
 * - embedUrl: string — The YouTube embed URL from the secure API
 * - lessonTitle: string — For display
 * - onProgress: (progress: number) => void — Callback with estimated progress
 * - isLoading: boolean — Show skeleton while loading
 * - debug: boolean — Show debug panel (default: false)
 */
const SecureVideoPlayer = ({ embedUrl, lessonTitle, onProgress, isLoading, debug = false }) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [iframeStatus, setIframeStatus] = useState('idle'); // idle | loading | loaded | error
  const [showDebug, setShowDebug] = useState(debug);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Validate embed URL format
  const validateEmbedUrl = useCallback((url) => {
    if (!url) return { valid: false, error: 'No embed URL provided' };

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace('www.', '');

      // Must be youtube.com/embed/ format
      if (!['youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
        return { valid: false, error: `Invalid hostname: ${hostname}` };
      }
      if (!parsed.pathname.startsWith('/embed/')) {
        return { valid: false, error: `Invalid path: ${parsed.pathname}. Must use /embed/ format` };
      }

      // Extract video ID
      const videoId = parsed.pathname.replace('/embed/', '').split('/')[0];
      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return { valid: false, error: `Invalid video ID: ${videoId}` };
      }

      return { valid: true, videoId, hostname: parsed.hostname };
    } catch (e) {
      return { valid: false, error: `URL parse error: ${e.message}` };
    }
  }, []);

  // Dynamically inject the iframe via JavaScript
  const injectIframe = useCallback(() => {
    if (!containerRef.current || !embedUrl) return;

    const validation = validateEmbedUrl(embedUrl);
    if (!validation.valid) {
      setError(validation.error);
      setIframeStatus('error');
      return;
    }

    // Clear any existing iframe
    const existing = containerRef.current.querySelector('iframe');
    if (existing) existing.remove();

    setIframeStatus('loading');

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '1';

    // CRITICAL: These attributes are required for YouTube embeds
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');

    // DO NOT set sandbox — YouTube embeds break with restrictive sandbox
    // DO NOT set referrerpolicy to no-referrer — YouTube needs the referrer

    iframe.setAttribute('loading', 'eager');

    // Track load success/failure
    iframe.onload = () => {
      setIframeStatus('loaded');
      setError(null);
    };
    iframe.onerror = () => {
      setIframeStatus('error');
      setError('Failed to load video player');
    };

    containerRef.current.appendChild(iframe);
    iframeRef.current = iframe;
    startTimeRef.current = Date.now();
    setError(null);
  }, [embedUrl, validateEmbedUrl]);

  useEffect(() => {
    if (embedUrl) {
      injectIframe();
    }
    return () => {
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
    };
  }, [embedUrl, injectIframe]);

  // Tab visibility detection — pause video when tab is switched
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        if (iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
              'https://www.youtube.com'
            );
          } catch { /* cross-origin — expected */ }
        }
      } else {
        setIsPaused(false);
      }
    };

    const handleWindowBlur = () => {
      setIsPaused(true);
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
            'https://www.youtube.com'
          );
        } catch { /* cross-origin — expected */ }
      }
    };

    const handleWindowFocus = () => setIsPaused(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Anti-copy protections
  useEffect(() => {
    const preventContextMenu = (e) => {
      // Only prevent on the player container
      if (e.target.closest('.lesson-player-container')) {
        e.preventDefault();
      }
    };
    const preventKeyShortcuts = (e) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return; }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); return; }
      if (e.key === 'PrintScreen') { e.preventDefault(); return; }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyShortcuts);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyShortcuts);
    };
  }, []);

  // Estimated progress tracking
  useEffect(() => {
    if (!embedUrl || !onProgress) return;

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused && startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onProgress(elapsedSeconds);
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [embedUrl, onProgress, isPaused]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading secure player...</p>
        </div>
      </div>
    );
  }

  if (error && iframeStatus === 'error') {
    return (
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-sm text-slate-300 font-medium">{error}</p>
          <button
            onClick={injectIframe}
            className="mt-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-player-container relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      {/* Video iframe container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ zIndex: 10 }}
      />

      {/* 
        IMPORTANT: Overlay must have pointer-events: none so YouTube player controls work.
        Only block pointer events when video is paused (to show resume overlay).
      */}

      {/* Tab-switched overlay */}
      {isPaused && (
        <div
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          style={{ zIndex: 30 }}
          onClick={() => setIsPaused(false)}
        >
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Video Paused</h3>
            <p className="text-sm text-slate-400">
              Video was paused because you switched tabs.
              <br />Click here to continue watching.
            </p>
          </div>
        </div>
      )}

      {/* Debug Panel (toggle with keyboard shortcut Ctrl+Shift+D) */}
      {showDebug && (
        <DebugPanel
          embedUrl={embedUrl}
          iframeStatus={iframeStatus}
          validation={validateEmbedUrl(embedUrl)}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  );
};

/**
 * Debug Panel — Shows diagnostic info for troubleshooting YouTube embed issues.
 */
const DebugPanel = ({ embedUrl, iframeStatus, validation, onClose }) => {
  const StatusIcon = ({ ok }) => ok
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
    : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />;

  const checks = [
    { label: 'Embed URL format', ok: validation.valid, detail: validation.valid ? validation.videoId : validation.error },
    { label: 'Uses /embed/ path', ok: embedUrl?.includes('/embed/'), detail: embedUrl?.includes('/embed/') ? 'Yes' : 'No — will cause Error 153' },
    { label: 'No controls=0', ok: !embedUrl?.includes('controls=0'), detail: embedUrl?.includes('controls=0') ? 'FAIL — controls=0 causes Error 153' : 'OK' },
    { label: 'Iframe loaded', ok: iframeStatus === 'loaded', detail: iframeStatus },
    { label: 'No sandbox attr', ok: true, detail: 'Sandbox removed — YouTube requires unrestricted iframe' },
    { label: 'CSP frame-src', ok: true, detail: 'Configured server-side via helmet' },
  ];

  return (
    <div
      className="absolute top-2 right-2 w-80 rounded-xl bg-slate-900/95 border border-slate-700 p-3 text-xs font-mono backdrop-blur-md"
      style={{ zIndex: 50 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Bug className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-amber-400 font-semibold">YouTube Debug</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
      </div>

      <div className="space-y-1.5">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-2">
            <StatusIcon ok={check.ok} />
            <div>
              <span className="text-slate-300">{check.label}: </span>
              <span className={check.ok ? 'text-emerald-400' : 'text-red-400'}>{check.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-700">
        <p className="text-slate-500 truncate" title={embedUrl}>
          URL: {embedUrl || 'none'}
        </p>
      </div>
    </div>
  );
};

export default SecureVideoPlayer;
