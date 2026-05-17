import React, { useContext, useState } from 'react';
import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BrandLogo from '../Shared/BrandLogo';
import {
  BookOpen,
  Users,
  LogOut,
  CheckCircle,
  LayoutDashboard,
  Sparkles,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teacher/courses', label: 'Assigned Courses', icon: BookOpen },
  { path: '/teacher/students', label: 'Course Students', icon: Users },
  { path: '/teacher/attendance', label: 'Take Attendance', icon: CheckCircle },
];

const TeacherLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/teacher-portal-7f4b2k1m" replace />;
  }

  if (user.actualRole !== 'teacher') {
    if (user.actualRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.actualRole === 'parent') {
      return <Navigate to="/parent/dashboard" replace />;
    }
    return <Navigate to="/teacher-portal-7f4b2k1m" replace />;
  }

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path || (path === '/teacher' && location.pathname === '/teacher/dashboard');
    return isActive
      ? 'flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-sky-500/12 px-4 py-3 font-medium text-sky-300 shadow-inner shadow-amber-950/20'
      : 'flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-300 transition duration-200 hover:bg-white/6 hover:text-white';
  };

  const sidebar = (
    <>
      <div className="flex h-20 items-center border-b border-white/10 px-6 shrink-0">
        <BrandLogo
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3"
          imageClassName="h-11 w-11"
          titleClassName="font-serif text-xl font-bold tracking-tight text-white"
          tagline="Teacher Workspace"
          taglineClassName="text-[11px] uppercase tracking-[0.28em] text-sky-100/70"
          textClassName=""
        />
      </div>

      <div className="px-4 pt-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-200">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-200">
            <Sparkles className="h-4 w-4" /> Teaching Snapshot
          </div>
          <p className="text-sm leading-relaxed text-slate-300/90">
            Manage assigned courses, monitor class rosters, and mark attendance with the same precision as the admin console.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className={getLinkClasses(path)} onClick={() => setMobileOpen(false)}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen font-sans bg-slate-950">
      <aside className="fixed z-40 hidden h-full w-72 flex-col border-r border-white/10 bg-slate-950 text-slate-300 md:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.14),transparent_30%)]"></div>
        <div className="relative flex h-full flex-col">{sidebar}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-slate-950 text-slate-300" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <span className="font-semibold text-white">Teacher Menu</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/10 p-2 text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex h-[calc(100%-77px)] flex-col">{sidebar}</div>
          </aside>
        </div>
      )}

      <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-hidden md:ml-72">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.12),transparent_22%),linear-gradient(180deg,#fffdf7_0%,#f8f5ea_48%,#f5efe0_100%)]"></div>

        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/78 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Teacher Workspace</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Course Command Desk</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">{user.name || 'Teacher User'}</p>
              <p className="text-xs text-slate-500">Teacher panel</p>
            </div>
            <button onClick={handleLogout} className="rounded-xl p-2 text-slate-400 transition hover:text-red-500" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="relative w-full flex-grow overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
