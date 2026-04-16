import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../../components/Shared/BrandLogo';

const Login = () => {
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
      // Route based on role and enrollment / admin override
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // student: only allow to student dashboard if enrolled or admin allowed
        if (user.course || user.studentPanelAllowed) {
          navigate('/student/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-300/15 blur-3xl opacity-50 mix-blend-screen"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            className="inline-flex items-center justify-center gap-3"
            imageClassName="h-14 w-14"
            titleClassName="font-bold text-2xl tracking-tight text-white"
            tagline={null}
            textClassName=""
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or <Link to="/" className="font-medium text-amber-400 hover:text-amber-300">return to home page</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10 border border-slate-700/50 shadow-2xl">
          
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
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
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white transition"
                  placeholder="admin@academicplus.com"
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
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-600 rounded bg-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 transition"
              >
                Sign in
              </button>
            </div>

            <p className="text-sm text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-amber-400 hover:text-amber-300">
                Create one here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
