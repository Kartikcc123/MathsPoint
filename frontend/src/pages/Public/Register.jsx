import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../../components/Shared/BrandLogo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        parentName,
        parentEmail,
        parentPhone,
      });
      navigate('/');
    } catch (err) {
      setError(err || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-900 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-yellow-300/15 blur-3xl opacity-50 mix-blend-screen"></div>

      <div className="relative z-10 text-center sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            className="inline-flex items-center justify-center gap-3"
            imageClassName="h-14 w-14"
            titleClassName="font-bold text-2xl tracking-tight text-white"
            tagline={null}
            textClassName=""
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">Create Student Account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Student and parent details are both required. Parent portal is created automatically and linked to this student.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="glass border border-slate-700/50 px-4 py-8 shadow-2xl sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
              Parent portal password will be set to the parent mobile number.
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Student Details</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Student name</label>
                <div className="mt-1">
                  <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm" placeholder="Student full name" />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Student mobile number</label>
                <div className="mt-1">
                  <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm" placeholder="Student mobile number" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Student email address</label>
                <div className="mt-1">
                  <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm" placeholder="student@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Student password</label>
                <div className="mt-1">
                  <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm" placeholder="........" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Parent Portal Details</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-300">Parent name</label>
                <div className="mt-1">
                  <input id="parentName" name="parentName" type="text" required value={parentName} onChange={(e) => setParentName(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm" placeholder="Parent full name" />
                </div>
              </div>

              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-300">Parent mobile number</label>
                <div className="mt-1">
                  <input id="parentPhone" name="parentPhone" type="tel" required value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm" placeholder="Used as parent portal password" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-300">Parent email address</label>
                <div className="mt-1">
                  <input id="parentEmail" name="parentEmail" type="email" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="block w-full appearance-none rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white shadow-sm placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm" placeholder="parent@example.com" />
                </div>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              Already have an account? <Link to="/login" className="text-sky-400">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
