import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Public/Home';
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
import AdminResults from './pages/Admin/AdminResults';
import AdminMaterials from './pages/Admin/AdminMaterials';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminNotifications from './pages/Admin/AdminNotifications';
import StudentDashboard from './pages/Student/Dashboard';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import StudentLayout from './components/Layout/StudentLayout';

// Student Pages
import MyCourses from './pages/Student/MyCourses';
import CourseViewer from './pages/Student/CourseViewer';
import Fees from './pages/Student/Fees';
import Results from './pages/Student/Results';
import Attendance from './pages/Student/Attendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
