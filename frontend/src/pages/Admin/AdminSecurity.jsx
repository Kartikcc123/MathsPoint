import React, { useState, useContext } from 'react';
import { Shield, ShieldAlert, Key, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AdminSecurity = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const start2FASetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/setup-2fa', {});
      setQrCodeUrl(res.data.qrCodeUrl);
      setSecret(res.data.secret);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await api.post('/auth/verify-setup-2fa', { code: verificationCode });
      if (res.data.success) {
        setSuccess('Two-Factor Authentication has been successfully enabled!');
        setIs2FAEnabled(true);
        setQrCodeUrl('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Shield className="h-6 w-6 text-sky-600" /> Security Settings
        </h1>
        <p className="mt-1 text-slate-500">Manage account security and Two-Factor Authentication (2FA).</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2 text-sm font-medium">
          <ShieldAlert className="h-5 w-5" /> {error}
        </div>
      )}
      
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700 flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="h-5 w-5" /> {success}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-slate-800">Two-Factor Authentication (2FA)</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Add an extra layer of security to your admin account. Once enabled, you'll need to enter a 6-digit code from your authenticator app (like Google Authenticator) every time you log in.
            </p>
            
            {is2FAEnabled ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 border border-green-200">
                <CheckCircle className="h-4 w-4" /> 2FA is Currently Enabled
              </div>
            ) : !qrCodeUrl ? (
              <button
                onClick={start2FASetup}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Key className="h-4 w-4" /> {loading ? 'Initializing...' : 'Enable 2FA Now'}
              </button>
            ) : null}
          </div>
        </div>

        {qrCodeUrl && !is2FAEnabled && (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Complete 2FA Setup</h3>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">1</div>
                  <div>
                    <p className="font-semibold text-slate-800">Scan QR Code</p>
                    <p className="text-sm text-slate-500 mt-1">Open Google Authenticator or Authy and scan this code.</p>
                  </div>
                </div>
                <div className="ml-12 p-4 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">2</div>
                  <div>
                    <p className="font-semibold text-slate-800">Verify Code</p>
                    <p className="text-sm text-slate-500 mt-1">Enter the 6-digit code from your app to verify setup.</p>
                  </div>
                </div>
                
                <form onSubmit={verifyAndEnable2FA} className="ml-12 space-y-4">
                  <input
                    type="text"
                    maxLength="6"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full max-w-[200px] rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="000000"
                  />
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify and Save'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSecurity;
