import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Courses from './pages/Public/Courses';
import Faculties from './pages/Public/Faculties';
import Contact from './pages/Public/Contact';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';

// Private Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminStudents from './pages/Admin/AdminStudents';
import AdminCourses from './pages/Admin/AdminCourses';
import AdminAttendance from './pages/Admin/AdminAttendance';
import SimpleAttendance from './pages/Admin/SimpleAttendance';
import AdminResults from './pages/Admin/AdminResults';
import AdminMaterials from './pages/Admin/AdminMaterials';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminNotifications from './pages/Admin/AdminNotifications';
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
import Fees from './pages/Student/Fees';
import Results from './pages/Student/Results';
import Attendance from './pages/Student/Attendance';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherCourses from './pages/Teacher/Courses';
import TeacherStudents from './pages/Teacher/Students';
import ParentDashboard from './pages/Parent/Dashboard';
import ParentChildren from './pages/Parent/Children';
import ParentAttendance from './pages/Parent/Attendance';

function App() {
  return (
    <BrowserRouter>
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
