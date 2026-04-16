import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../../components/Shared/BrandLogo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(name, email, password);
      // After registration redirect to home
      navigate('/');
    } catch (err) {
      setError(err || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">Create an account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          After registering you'll be redirected to home.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10 border border-slate-700/50 shadow-2xl">

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full name</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white transition" placeholder="Your name" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white transition" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-white transition" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 transition">
                Create account
              </button>
            </div>

            <p className="text-sm text-gray-400 text-center">
              Already have an account? <Link to="/login" className="text-amber-400">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
