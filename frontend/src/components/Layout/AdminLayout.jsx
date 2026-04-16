import React, { useContext, useState } from 'react';
import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import BrandLogo from '../Shared/BrandLogo';
import {
  BookOpen,
  Users,
  LogOut,
  CheckCircle,
  Bell,
  LayoutDashboard,
  FileText,
  Sparkles,
  Menu,
  X,
  FolderOpen,
  Receipt,
  Megaphone,
  LoaderCircle,
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Manage Students', icon: Users },
  { path: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
  { path: '/admin/materials', label: 'Publish Materials', icon: FolderOpen },
  { path: '/admin/payments', label: 'Payment Records', icon: Receipt },
  { path: '/admin/notifications', label: 'Notifications', icon: Megaphone },
  { path: '/admin/attendance', label: 'Master Attendance', icon: CheckCircle },
  { path: '/admin/results', label: 'Test Results', icon: FileText },
];

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await api.get('/admin/notifications');
      setNotifications(res.data || []);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin/dashboard');
    return isActive
      ? 'flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/12 px-4 py-3 font-medium text-amber-300 shadow-inner shadow-amber-950/20'
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
          tagline="Admin Control Suite"
          taglineClassName="text-[11px] uppercase tracking-[0.28em] text-amber-100/70"
          textClassName=""
        />
      </div>

      <div className="px-4 pt-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-200">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200">
            <Sparkles className="h-4 w-4" /> Operations Snapshot
          </div>
          <p className="text-sm leading-relaxed text-slate-300/90">
            Keep pharmacy admissions, course delivery, attendance, and academic records aligned from one workspace.
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
              <span className="font-semibold text-white">Admin Menu</span>
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Admin Workspace</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Control Center</h1>
            </div>
          </div>

          <div className="relative flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button
                onClick={() => {
                  const next = !showNotifications;
                  setShowNotifications(next);
                  if (next) {
                    loadNotifications();
                  }
                }}
                className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:text-slate-700"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-amber-500"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                    <h3 className="font-bold text-slate-800">Admin Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex items-center justify-center gap-3 p-6 text-sm text-slate-500">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading notifications...
                      </div>
                    ) : notifications.length ? (
                      notifications.slice(0, 6).map((notification) => (
                        <div key={notification._id} className="cursor-pointer border-b border-slate-50 p-4 transition hover:bg-slate-50">
                          <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                          <p className="mt-2 text-xs text-slate-400">{new Date(notification.updatedAt || notification.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-sm text-slate-500">No notifications created yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-sm">
                A
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500">Pharmacy operations admin</p>
              </div>
              <button onClick={handleLogout} className="rounded-xl p-2 text-slate-400 transition hover:text-red-500" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="relative w-full flex-grow overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
