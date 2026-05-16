import React, { useContext, useState } from 'react';
import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import BrandLogo from '../Shared/BrandLogo';
import {
  LogOut,
  Bell,
  Menu,
  X,
  BookOpen,
  Edit3,
  BarChart3,
  CheckCircle,
  Phone,
  Info,
  MonitorPlay,
  UserCircle,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';

const sidebarSections = [
  {
    title: 'LEARN ONLINE',
    items: [
      { path: '/student/dashboard', label: 'Study', icon: Edit3 },
    ]
  },
  {
    title: 'STUDY PACKS',
    items: [
      { path: '/student/courses', label: 'Batches', icon: MonitorPlay },
      { path: '/student/test-series', label: 'Test Series', icon: BookOpen },
    ]
  },
  {
    title: 'PERFORMANCE',
    items: [
      { path: '/student/results', label: 'Results', icon: BarChart3 },
      { path: '/student/attendance', label: 'Attendance', icon: CheckCircle },
    ]
  },
  {
    title: 'MORE',
    items: [
      { path: '/contact', label: 'Contact Us', icon: Phone },
      { path: '/about', label: 'About us', icon: Info },
    ]
  }
];

const StudentLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  // Only allow access if student is enrolled in a course OR admin granted access
  if (!user.course && !user.studentPanelAllowed) {
    return <Navigate to="/" replace />;
  }

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path || (path === '/student/dashboard' && location.pathname === '/student');
    return isActive
      ? 'flex items-center gap-3 px-4 py-2.5 text-[15px] font-semibold bg-indigo-100/50 text-indigo-700 border-r-4 border-indigo-600'
      : 'flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors';
  };

  // Check if we are in the video player route to hide the standard sidebar/nav
  const isPlayerRoute = location.pathname.includes('/lesson/');

  if (isPlayerRoute) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
        <Outlet />
      </div>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center h-16 px-6 border-b border-slate-100 shrink-0">
        <BrandLogo
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 cursor-pointer"
          imageClassName="h-8 w-8"
          titleClassName="font-bold text-xl tracking-tight text-slate-800"
          taglineClassName="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
        {sidebarSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </h3>
            <nav className="flex flex-col">
              {section.items.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} className={getLinkClasses(path)} onClick={() => setMobileOpen(false)}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop Sidebar */}
      <aside className="fixed z-40 hidden h-full w-[260px] md:flex flex-col">
        {sidebar}
      </aside>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
              <span className="font-bold text-slate-800">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">{sidebar}</div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative flex min-h-screen w-full flex-col md:ml-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800">Maths Point Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors">
              <Bell className="h-[22px] w-[22px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="relative border-l border-slate-200 pl-4">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-[15px] font-bold text-slate-800 leading-none">Hi, {user?.name?.split(' ')[0]}</p>
                </div>
                <div className="flex items-center justify-center w-9 h-9 text-slate-800 bg-[#ffca28] rounded-full font-bold shadow-sm">
                  {user?.name?.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" strokeWidth={2} />
              </button>

              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 py-2 z-50">
                    <Link to="/student/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <UserCircle className="w-[22px] h-[22px] text-slate-700" strokeWidth={1.5} />
                      My Profile
                    </Link>
                    <Link to="/student/purchases" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <ShoppingBag className="w-[22px] h-[22px] text-slate-700" strokeWidth={1.5} />
                      My Purchases
                    </Link>
                    <div className="h-px bg-slate-200/60 my-1.5 mx-4"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <LogOut className="w-[22px] h-[22px] text-slate-700" strokeWidth={1.5} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
