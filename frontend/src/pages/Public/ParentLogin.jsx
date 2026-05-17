import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../../components/Shared/BrandLogo';

const ParentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === 'admin' || user.actualRole === 'teacher') {
        setError('Teachers and administrators must use the secure staff portal.');
        return;
      }

      if (user.actualRole !== 'parent') {
        setError('This portal is only for parents. Students should use the student login page.');
        return;
      }

      navigate('/parent/dashboard');
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-950 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl opacity-50 mix-blend-screen"></div>

      <div className="relative z-10 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            className="inline-flex items-center justify-center gap-3"
            imageClassName="h-14 w-14"
            titleClassName="text-2xl font-bold tracking-tight text-white"
            tagline={null}
            textClassName=""
          />
        </div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">Parent Portal Sign In</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          For parent accounts only.{' '}
          <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Student login here
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass border border-slate-700/50 px-4 py-8 shadow-2xl sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Parent Email Address
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
                  className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="parent@mathspoint.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
                  className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="........"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:brightness-105 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in to Parent Portal'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              Looking for student access?{' '}
              <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
                Open student login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin;
