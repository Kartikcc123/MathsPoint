import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../../components/Shared/BrandLogo';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA State
  const [require2FA, setRequire2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [twoFaCode, setTwoFaCode] = useState('');

  const navigate = useNavigate();
  const { login, verify2FA } = useContext(AuthContext);

  const handleRouteRedirect = (user) => {
    if (user.role === 'admin' || user.actualRole === 'teacher') {
      navigate('/admin/dashboard');
    } else {
      setError('Access denied. You are not an administrator.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      // Ensure only admins/teachers use this
      if (result.role !== 'admin' && result.actualRole !== 'teacher') {
         setError('Access denied. This portal is strictly for administrators.');
         return;
      }

      if (result.require2FA) {
        setRequire2FA(true);
        setUserId(result.userId);
      } else {
        handleRouteRedirect(result);
      }
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await verify2FA(userId, twoFaCode);
      handleRouteRedirect(user);
    } catch (err) {
      setError(err || 'Invalid authenticator code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl opacity-50 mix-blend-screen"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mb-6 flex justify-center">
           <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-800 border border-slate-700">
             <Lock className="h-8 w-8 text-rose-500" />
           </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
          {require2FA ? 'Two-Factor Authentication' : 'Secure Admin Portal'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 uppercase tracking-widest font-semibold">
          Restricted Access Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 sm:rounded-2xl sm:px-10 border border-slate-700/50 shadow-2xl">
          
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {!require2FA ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Administrator Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white transition"
                    placeholder="admin@academicplus.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-slate-900 transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Access Portal'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handle2FASubmit}>
              <div className="flex flex-col items-center justify-center mb-6">
                 <ShieldCheck className="w-16 h-16 text-rose-500 mb-2" />
                 <p className="text-sm text-center text-slate-300">
                   Open your Authenticator app and enter the 6-digit code to continue.
                 </p>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-300 text-center">
                  6-Digit Authenticator Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength="6"
                    required
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-3 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-2xl text-center tracking-widest text-white transition"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || twoFaCode.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-slate-900 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
              
              <div className="text-center">
                <button type="button" onClick={() => setRequire2FA(false)} className="text-sm text-slate-400 hover:text-white transition">
                  Cancel login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
