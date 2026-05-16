import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Globe, Trash2, Shield, Loader2 } from 'lucide-react';
import api from '../../services/api';

/**
 * ActiveSessions — Shows logged-in devices and allows termination.
 * Integrated into Student Dashboard.
 */
const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [maxDevices, setMaxDevices] = useState(2);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/session/active');
      setSessions(res.data.sessions || []);
      setMaxDevices(res.data.maxDevices || 2);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (sessionId) => {
    if (!window.confirm('This will log out the device. Continue?')) return;
    try {
      setTerminating(sessionId);
      await api.delete(`/session/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session', error);
    } finally {
      setTerminating(null);
    }
  };

  const getDeviceIcon = (info) => {
    if (!info) return <Monitor className="h-5 w-5" />;
    const lower = info.toLowerCase();
    if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const currentDeviceId = localStorage.getItem('mp_device_id');

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-sky-400" />
          <h3 className="text-lg font-bold text-white">Active Sessions</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <Shield className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Active Sessions</h3>
            <p className="text-xs text-slate-400">
              {sessions.length}/{maxDevices} devices active
            </p>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No active sessions found.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isCurrentDevice = session.deviceId === currentDeviceId;
            return (
              <div
                key={session._id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  isCurrentDevice
                    ? 'border-sky-500/30 bg-sky-500/10'
                    : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isCurrentDevice ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {session.deviceInfo || 'Unknown Device'}
                      </p>
                      {isCurrentDevice && (
                        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Globe className="h-3 w-3" />
                        {session.ipAddress || 'Unknown IP'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Last active: {formatDate(session.lastActiveAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCurrentDevice && (
                  <button
                    onClick={() => handleTerminate(session._id)}
                    disabled={terminating === session._id}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {terminating === session._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Logout
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sessions.length >= maxDevices && (
        <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-xs text-amber-400">
            ⚠️ Maximum device limit reached ({maxDevices}). New logins will automatically log out the oldest device.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveSessions;
