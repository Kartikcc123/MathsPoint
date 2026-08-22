import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts (Static imports to prevent shell flashing)
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import StudentLayout from './components/Layout/StudentLayout';
import TeacherLayout from './components/Layout/TeacherLayout';
import ParentLayout from './components/Layout/ParentLayout';
import ScrollToTop from './components/Shared/ScrollToTop';

// Lazy-loaded Public Pages
const Home = lazy(() => import('./pages/Public/Home'));
const About = lazy(() => import('./pages/Public/About'));
const Courses = lazy(() => import('./pages/Public/Courses'));
const Faculties = lazy(() => import('./pages/Public/Faculties'));
const Contact = lazy(() => import('./pages/Public/Contact'));
const Login = lazy(() => import('./pages/Public/Login'));
const FreeStudyMaterials = lazy(() => import('./pages/Public/FreeStudyMaterials'));
const PrivacyPolicy = lazy(() => import('./pages/Public/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/Public/TermsAndConditions'));
const AccountDeletion = lazy(() => import('./pages/Public/AccountDeletion'));
const ParentLogin = lazy(() => import('./pages/Public/ParentLogin'));
const TeacherLogin = lazy(() => import('./pages/Public/TeacherLogin'));
const Register = lazy(() => import('./pages/Public/Register'));
const Checkout = lazy(() => import('./pages/Public/Checkout'));
const AdminLogin = lazy(() => import('./pages/Public/AdminLogin'));
const ResetPassword = lazy(() => import('./pages/Public/ResetPassword'));

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/Admin/AdminStudents'));
const AdminParents = lazy(() => import('./pages/Admin/AdminParents'));
const AdminTeachers = lazy(() => import('./pages/Admin/AdminTeachers'));
const AdminCourses = lazy(() => import('./pages/Admin/AdminCourses'));
const AdminAttendance = lazy(() => import('./pages/Admin/AdminAttendance'));
const AdminResults = lazy(() => import('./pages/Admin/AdminResults'));
const AdminSecurity = lazy(() => import('./pages/Admin/AdminSecurity'));
const AdminMaterials = lazy(() => import('./pages/Admin/AdminMaterials'));
const AdminCourseDetail = lazy(() => import('./pages/Admin/AdminCourseDetail'));
const AdminPayments = lazy(() => import('./pages/Admin/AdminPayments'));
const AdminNotifications = lazy(() => import('./pages/Admin/AdminNotifications'));
const AdminLessons = lazy(() => import('./pages/Admin/AdminLessons'));
const AdminFreeMaterials = lazy(() => import('./pages/Admin/AdminFreeMaterials'));
const AdminHomeContent = lazy(() => import('./pages/Admin/AdminHomeContent'));
const AdminAdvertisements = lazy(() => import('./pages/Admin/AdminAdvertisements'));

// Lazy-loaded Student Pages
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'));
const MyCourses = lazy(() => import('./pages/Student/MyCourses'));
const CourseViewer = lazy(() => import('./pages/Student/CourseViewer'));
const Results = lazy(() => import('./pages/Student/Results'));
const TestSeries = lazy(() => import('./pages/Student/TestSeries'));
const Attendance = lazy(() => import('./pages/Student/Attendance'));
const LessonPlayer = lazy(() => import('./pages/Student/LessonPlayer'));
const Profile = lazy(() => import('./pages/Student/Profile'));
const Purchases = lazy(() => import('./pages/Student/Purchases'));
const MaterialPlayer = lazy(() => import('./pages/Student/MaterialPlayer'));

// Lazy-loaded Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'));
const TeacherCourses = lazy(() => import('./pages/Teacher/Courses'));
const TeacherStudents = lazy(() => import('./pages/Teacher/Students'));

// Lazy-loaded Parent Pages
const ParentDashboard = lazy(() => import('./pages/Parent/Dashboard'));
const ParentChildren = lazy(() => import('./pages/Parent/Children'));
const ParentAttendance = lazy(() => import('./pages/Parent/Attendance'));

const PageLoader = () => (
  <div className="flex h-[70vh] w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="courses" element={<Courses />} />
            <Route path="faculties" element={<Faculties />} />
            <Route path="contact" element={<Contact />} />
            <Route path="free-study-materials" element={<FreeStudyMaterials />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="account-deletion" element={<AccountDeletion />} />
            <Route path="checkout/:courseId" element={<Checkout />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/parent-login" element={<ParentLogin />} />
          <Route path="/teacher-portal-7f4b2k1m" element={<TeacherLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal-8a9d3f2c" element={<AdminLogin />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="parents" element={<AdminParents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="advertisements" element={<AdminAdvertisements />} />
            <Route path="home-content" element={<AdminHomeContent />} />
            <Route path="free-materials" element={<AdminFreeMaterials />} />
            <Route path="courses/:courseId" element={<AdminCourseDetail />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="lessons" element={<AdminLessons />} />
          </Route>
          
          {/* Student Panel Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="courses/active" element={<CourseViewer />} />
            <Route path="results" element={<Results />} />
            <Route path="test-series" element={<TestSeries />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="profile" element={<Profile />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="lesson/:lessonId" element={<LessonPlayer />} />
            <Route path="material/:materialId" element={<MaterialPlayer />} />
          </Route>

          {/* Teacher Panel Routes */}
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
          </Route>

          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="children" element={<ParentChildren />} />
            <Route path="attendance" element={<ParentAttendance />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
