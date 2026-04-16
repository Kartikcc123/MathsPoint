import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Filter, UserPlus, ShieldCheck, X, BookOpenCheck, LoaderCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  studentId: '',
  parentEmail: '',
  parentPhone: '',
  phone: '',
  address: '',
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseSelections, setCourseSelections] = useState({});
  const [assigningStudentId, setAssigningStudentId] = useState('');
  const [togglingPanelId, setTogglingPanelId] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/courses'),
      ]);

      const loadedStudents = studentsRes.data || [];
      setStudents(loadedStudents);
      setCourses(coursesRes.data || []);
      setCourseSelections(
        loadedStudents.reduce((accumulator, student) => {
          accumulator[student._id] = student.course?._id || '';
          return accumulator;
        }, {})
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;

    return students.filter((student) =>
      [student.name, student.email, student.studentId, student.course?.title, student.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [search, students]);

  const studentsWithoutCourse = useMemo(
    () => students.filter((student) => !student.course).length,
    [students]
  );

  const openModal = () => {
    setError('');
    setSuccess('');
    setForm(initialForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        parentEmail: form.parentEmail.trim(),
        parentPhone: form.parentPhone.trim(),
        studentId: form.studentId.trim(),
        address: form.address.trim(),
      };

      const res = await api.post('/admin/student', payload);
      const createdStudent = res.data;

      setStudents((current) => [createdStudent, ...current]);
      setCourseSelections((current) => ({ ...current, [createdStudent._id]: '' }));
      setSuccess('Student record created successfully. Course access can now be assigned from the table.');
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSaving(false);
    }
  };

  const handleCourseSelectionChange = (studentId, courseId) => {
    setCourseSelections((current) => ({ ...current, [studentId]: courseId }));
  };

  const handleAssignCourse = async (studentId) => {
    setAssigningStudentId(studentId);
    setError('');
    setSuccess('');

    try {
      const courseId = courseSelections[studentId] || '';
      const res = await api.patch(`/admin/student/${studentId}/course`, { courseId });
      const updatedStudent = res.data;

      setStudents((current) =>
        current.map((student) => (student._id === updatedStudent._id ? updatedStudent : student))
      );
      setCourseSelections((current) => ({ ...current, [studentId]: updatedStudent.course?._id || '' }));
      setSuccess(updatedStudent.course ? 'Course access updated successfully.' : 'Course access removed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course access.');
    } finally {
      setAssigningStudentId('');
    }
  };

  const handleTogglePanel = async (student) => {
    const studentId = student._id;
    setTogglingPanelId(studentId);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/admin/student/${studentId}/panel`, { allow: !student.studentPanelAllowed });
      const updatedStudent = res.data;
      setStudents((current) => current.map((s) => (s._id === updatedStudent._id ? updatedStudent : s)));
      setSuccess(updatedStudent.studentPanelAllowed ? 'Student panel access granted.' : 'Student panel access revoked.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student panel access.');
    } finally {
      setTogglingPanelId('');
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name}? This will also remove their related fee, result, notification, and attendance records.`);

    if (!confirmed) {
      return;
    }

    setDeletingStudentId(student._id);
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/admin/student/${student._id}`);
      setStudents((current) => current.filter((item) => item._id !== student._id));
      setCourseSelections((current) => {
        const next = { ...current };
        delete next[student._id];
        return next;
      });
      setSuccess(res.data?.message || 'Student deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeletingStudentId('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Users className="h-6 w-6 text-blue-600" /> Student Directory
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Create student records automatically, then grant course access only from the admin panel.</p>
        </div>
        <button onClick={openModal} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <UserPlus className="h-5 w-5" /> Add New Student
        </button>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Total students</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{students.length}</p>
          <p className="mt-2 text-sm text-emerald-600">Saved automatically to the database</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Awaiting course access</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{studentsWithoutCourse}</p>
          <p className="mt-2 text-sm text-slate-500">Students stay unassigned until an admin grants access</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Verification</p>
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> Duplicate protection active
          </p>
          <p className="mt-2 text-sm text-slate-500">Repeated email, mobile number, student ID, and name entries are blocked</p>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, mobile, ID, or course..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-600">
            <Filter className="h-4 w-4" /> {courses.length} course options
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Student ID</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Course Access</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{student.studentId || 'Not assigned'}</td>
                  <td className="px-6 py-4 text-slate-600">{student.phone || student.parentPhone || 'No phone saved'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <select
                        value={courseSelections[student._id] ?? student.course?._id ?? ''}
                        onChange={(event) => handleCourseSelectionChange(student._id, event.target.value)}
                        className="min-w-[220px] rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No course access</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAssignCourse(student._id)}
                        disabled={assigningStudentId === student._id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {assigningStudentId === student._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BookOpenCheck className="h-4 w-4" />}
                        {assigningStudentId === student._id ? 'Saving...' : 'Update Access'}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-xs text-slate-500">Current access: {student.course?.title || 'No course assigned'}</p>
                      <button
                        onClick={() => handleTogglePanel(student)}
                        disabled={togglingPanelId === student._id || deletingStudentId === student._id}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${student.studentPanelAllowed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'} ${togglingPanelId === student._id ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'}`}
                      >
                        {togglingPanelId === student._id ? 'Saving...' : (student.studentPanelAllowed ? 'Panel Allowed' : 'Allow Panel')}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student)}
                      disabled={deletingStudentId === student._id}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {deletingStudentId === student._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {deletingStudentId === student._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center text-slate-500">
                    {loading ? 'Loading students...' : 'No students found yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Create Student</h3>
                <p className="text-sm text-slate-500">Student details are saved immediately. Course access is assigned separately by admin after creation.</p>
              </div>
              <button onClick={closeModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Student name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Student email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="Student ID" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Student mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="Parent phone" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange} placeholder="Parent email" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Course selection is intentionally not part of registration. Only admins can grant or remove course access from the student directory.
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
