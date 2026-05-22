import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Courses from './pages/Public/Courses';
import Faculties from './pages/Public/Faculties';
import Contact from './pages/Public/Contact';
import Login from './pages/Public/Login';
import FreeStudyMaterials from './pages/Public/FreeStudyMaterials';
import ParentLogin from './pages/Public/ParentLogin';
import TeacherLogin from './pages/Public/TeacherLogin';
import Register from './pages/Public/Register';
import Checkout from './pages/Public/Checkout';
import AdminLogin from './pages/Public/AdminLogin';

// Private Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminStudents from './pages/Admin/AdminStudents';
import AdminParents from './pages/Admin/AdminParents';
import AdminTeachers from './pages/Admin/AdminTeachers';
import AdminCourses from './pages/Admin/AdminCourses';
import AdminAttendance from './pages/Admin/AdminAttendance';
import AdminResults from './pages/Admin/AdminResults';
import AdminSecurity from './pages/Admin/AdminSecurity';
import AdminMaterials from './pages/Admin/AdminMaterials';
import AdminCourseDetail from './pages/Admin/AdminCourseDetail';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminNotifications from './pages/Admin/AdminNotifications';
import AdminLessons from './pages/Admin/AdminLessons';
import AdminFreeMaterials from './pages/Admin/AdminFreeMaterials';
import StudentDashboard from './pages/Student/Dashboard';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import StudentLayout from './components/Layout/StudentLayout';
import TeacherLayout from './components/Layout/TeacherLayout';
import ParentLayout from './components/Layout/ParentLayout';

// Student Pages
import MyCourses from './pages/Student/MyCourses';
import CourseViewer from './pages/Student/CourseViewer';
import Results from './pages/Student/Results';
import TestSeries from './pages/Student/TestSeries';
import Attendance from './pages/Student/Attendance';
import LessonPlayer from './pages/Student/LessonPlayer';
import Profile from './pages/Student/Profile';
import Purchases from './pages/Student/Purchases';
import MaterialPlayer from './pages/Student/MaterialPlayer';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherCourses from './pages/Teacher/Courses';
import TeacherStudents from './pages/Teacher/Students';
import ParentDashboard from './pages/Parent/Dashboard';
import ParentChildren from './pages/Parent/Children';
import ParentAttendance from './pages/Parent/Attendance';
import ScrollToTop from './components/Shared/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="contact" element={<Contact />} />
          <Route path="free-study-materials" element={<FreeStudyMaterials />} />
          <Route path="checkout/:courseId" element={<Checkout />} />
        </Route>
        <Route path="/login" element={<Login />} />
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
    </BrowserRouter>
  );
}

export default App;
