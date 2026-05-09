import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalLoader from './components/Shared/GlobalLoader';

// Public Pages
const Home = lazy(() => import('./pages/Public/Home'));
const About = lazy(() => import('./pages/Public/About'));
const Courses = lazy(() => import('./pages/Public/Courses'));
const Faculties = lazy(() => import('./pages/Public/Faculties'));
const Contact = lazy(() => import('./pages/Public/Contact'));
const Login = lazy(() => import('./pages/Public/Login'));
const Register = lazy(() => import('./pages/Public/Register'));

// Layouts (Layouts usually don't need lazy loading if they are shell components, but keeping consistent or just lazy loading pages is best. We'll lazy load them too for max splitting)
const MainLayout = lazy(() => import('./components/Layout/MainLayout'));
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));
const StudentLayout = lazy(() => import('./components/Layout/StudentLayout'));
const TeacherLayout = lazy(() => import('./components/Layout/TeacherLayout'));
const ParentLayout = lazy(() => import('./components/Layout/ParentLayout'));

// Private Pages - Admin
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/Admin/AdminStudents'));
const AdminCourses = lazy(() => import('./pages/Admin/AdminCourses'));
const AdminAttendance = lazy(() => import('./pages/Admin/AdminAttendance'));
const SimpleAttendance = lazy(() => import('./pages/Admin/SimpleAttendance'));
const AdminResults = lazy(() => import('./pages/Admin/AdminResults'));
const AdminMaterials = lazy(() => import('./pages/Admin/AdminMaterials'));
const AdminPayments = lazy(() => import('./pages/Admin/AdminPayments'));
const AdminNotifications = lazy(() => import('./pages/Admin/AdminNotifications'));

// Private Pages - Student
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'));
const MyCourses = lazy(() => import('./pages/Student/MyCourses'));
const CourseViewer = lazy(() => import('./pages/Student/CourseViewer'));
const Fees = lazy(() => import('./pages/Student/Fees'));
const Results = lazy(() => import('./pages/Student/Results'));
const Attendance = lazy(() => import('./pages/Student/Attendance'));

// Private Pages - Teacher
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'));
const TeacherCourses = lazy(() => import('./pages/Teacher/Courses'));
const TeacherStudents = lazy(() => import('./pages/Teacher/Students'));

// Private Pages - Parent
const ParentDashboard = lazy(() => import('./pages/Parent/Dashboard'));
const ParentChildren = lazy(() => import('./pages/Parent/Children'));
const ParentAttendance = lazy(() => import('./pages/Parent/Attendance'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="courses" element={<Courses />} />
            <Route path="faculties" element={<Faculties />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="attendance/simple" element={<SimpleAttendance />} />
            <Route path="results" element={<AdminResults />} />
          </Route>
          
          {/* Student Panel Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="courses/active" element={<CourseViewer />} />
            <Route path="fees" element={<Fees />} />
            <Route path="results" element={<Results />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Teacher Panel Routes */}
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
          </Route>

          {/* Parent Panel Routes */}
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
