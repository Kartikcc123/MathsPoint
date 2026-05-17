import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Filter, UserPlus, ShieldCheck, X, BookOpenCheck, LoaderCircle, Trash2, MailPlus, Clock3, CheckCircle2, UserRoundPlus, GraduationCap } from 'lucide-react';
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

const initialParentForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  linkedStudents: [],
};

const initialTeacherForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  taughtCourses: [],
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [parentForm, setParentForm] = useState(initialParentForm);
  const [teacherForm, setTeacherForm] = useState(initialTeacherForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseSelections, setCourseSelections] = useState({});
  const [assigningStudentId, setAssigningStudentId] = useState('');
  const [togglingPanelId, setTogglingPanelId] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState('');
  const [updatingInquiryId, setUpdatingInquiryId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, coursesRes, inquiriesRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/courses'),
        api.get('/admin/inquiries'),
      ]);

      const loadedStudents = studentsRes.data || [];
      setStudents(loadedStudents);
      setCourses(coursesRes.data || []);
      setInquiries(inquiriesRes.data || []);
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

  const newInquiryCount = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status === 'New').length,
    [inquiries]
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

  const openParentModal = () => {
    setError('');
    setSuccess('');
    setParentForm(initialParentForm);
    setShowParentModal(true);
  };

  const closeParentModal = () => {
    setShowParentModal(false);
    setParentForm(initialParentForm);
  };

  const openTeacherModal = () => {
    setError('');
    setSuccess('');
    setTeacherForm(initialTeacherForm);
    setShowTeacherModal(true);
  };

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setTeacherForm(initialTeacherForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleParentChange = (event) => {
    const { name, value } = event.target;
    setParentForm((current) => ({ ...current, [name]: value }));
  };

  const handleTeacherChange = (event) => {
    const { name, value } = event.target;
    setTeacherForm((current) => ({ ...current, [name]: value }));
  };

  const handleParentStudentToggle = (studentId) => {
    setParentForm((current) => ({
      ...current,
      linkedStudents: current.linkedStudents.includes(studentId)
        ? current.linkedStudents.filter((id) => id !== studentId)
        : [...current.linkedStudents, studentId],
    }));
  };

  const handleTeacherCourseToggle = (courseId) => {
    setTeacherForm((current) => ({
      ...current,
      taughtCourses: current.taughtCourses.includes(courseId)
        ? current.taughtCourses.filter((id) => id !== courseId)
        : [...current.taughtCourses, courseId],
    }));
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

  const handleParentSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: parentForm.name.trim(),
        email: parentForm.email.trim(),
        password: parentForm.password,
        phone: parentForm.phone.trim(),
        address: parentForm.address.trim(),
        role: 'parent',
        linkedStudents: parentForm.linkedStudents,
      };

      await api.post('/admin/user', payload);
      setSuccess('Parent account created successfully. It can now log in through the dedicated parent portal.');
      closeParentModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parent account.');
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: teacherForm.name.trim(),
        email: teacherForm.email.trim(),
        password: teacherForm.password,
        phone: teacherForm.phone.trim(),
        address: teacherForm.address.trim(),
        role: 'teacher',
        taughtCourses: teacherForm.taughtCourses,
      };

      await api.post('/admin/user', payload);
      setSuccess('Teacher account created successfully. It can now log in through the secure staff portal.');
      closeTeacherModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher account.');
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

  const handleReviewInquiry = async (inquiry) => {
    setUpdatingInquiryId(inquiry._id);
    setError('');
    setSuccess('');

    try {
      const nextStatus = inquiry.status === 'Reviewed' ? 'New' : 'Reviewed';
      const res = await api.patch(`/admin/inquiry/${inquiry._id}`, { status: nextStatus });
      const updatedInquiry = res.data;

      setInquiries((current) =>
        current.map((item) => (item._id === updatedInquiry._id ? updatedInquiry : item))
      );
      setSuccess(updatedInquiry.status === 'Reviewed' ? 'Inquiry marked as reviewed.' : 'Inquiry marked as new again.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update inquiry.');
    } finally {
      setUpdatingInquiryId('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Users className="h-6 w-6 text-sky-600" /> Student Directory
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Create student records automatically, then grant course access only from the admin panel.</p>
        </div>
        <button onClick={openModal} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-700">
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
            <ShieldCheck className="h-5 w-5 text-sky-600" /> Duplicate protection active
          </p>
          <p className="mt-2 text-sm text-slate-500">Repeated email, mobile number, student ID, and name entries are blocked</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">New inquiries</p>
          <p className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-800">
            <MailPlus className="h-7 w-7 text-violet-600" /> {newInquiryCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">Fresh website inquiries submitted from the contact page</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">New Inquiries</h3>
            <p className="mt-1 text-sm text-slate-500">Contact form requests appear here before you decide to create a full student record.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
            <Clock3 className="h-4 w-4" /> {inquiries.length} total inquiries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Inquirer</th>
                <th className="px-6 py-4 font-semibold">Program</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && inquiries.length > 0 ? inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="border-b border-slate-50 align-top transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{inquiry.name}</p>
                    <p className="text-xs text-slate-500">{inquiry.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{inquiry.phone || 'No phone shared'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{inquiry.program || 'General inquiry'}</td>
                  <td className="px-6 py-4 text-slate-700">{inquiry.subject || 'Admission inquiry'}</td>
                  <td className="px-6 py-4">
                    <p className="max-w-sm whitespace-normal text-sm leading-6 text-slate-600">{inquiry.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(inquiry.createdAt).toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      inquiry.status === 'New' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleReviewInquiry(inquiry)}
                      disabled={updatingInquiryId === inquiry._id}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingInquiryId === inquiry._id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {inquiry.status === 'New' ? 'Mark Reviewed' : 'Mark New'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-slate-500">
                    {loading ? 'Loading inquiries...' : 'No inquiries submitted yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                        className="min-w-[220px] rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                <input name="name" value={form.name} onChange={handleChange} placeholder="Student name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Student email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="Student ID" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Student mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="Parent phone" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange} placeholder="Parent email" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />

              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                Course selection is intentionally not part of registration. Only admins can grant or remove course access from the student directory.
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Create Parent Account</h3>
                <p className="text-sm text-slate-500">Parents will use the dedicated parent portal to monitor linked student records.</p>
              </div>
              <button onClick={closeParentModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleParentSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                <input name="name" value={parentForm.name} onChange={handleParentChange} placeholder="Parent name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input name="email" type="email" value={parentForm.email} onChange={handleParentChange} placeholder="Parent email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input name="password" type="password" value={parentForm.password} onChange={handleParentChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input name="phone" value={parentForm.phone} onChange={handleParentChange} placeholder="Parent mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <textarea name="address" value={parentForm.address} onChange={handleParentChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-emerald-800">Link Students</p>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
                    {students.length > 0 ? students.map((student) => (
                      <label key={student._id} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={parentForm.linkedStudents.includes(student._id)}
                          onChange={() => handleParentStudentToggle(student._id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                          <span className="block font-semibold text-slate-800">{student.name}</span>
                          <span className="block text-xs text-slate-500">{student.email} {student.studentId ? `• ${student.studentId}` : ''}</span>
                        </span>
                      </label>
                    )) : (
                      <p className="text-sm text-slate-500">No student records available to link yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  This parent will log in from the dedicated portal at <span className="font-semibold">`/parent-login`</span>.
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button type="button" onClick={closeParentModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Create Teacher Account</h3>
                <p className="text-sm text-slate-500">Teachers will use the secure staff portal and see only the courses assigned here.</p>
              </div>
              <button onClick={closeTeacherModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" value={teacherForm.name} onChange={handleTeacherChange} placeholder="Teacher name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <input name="email" type="email" value={teacherForm.email} onChange={handleTeacherChange} placeholder="Teacher email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <input name="password" type="password" value={teacherForm.password} onChange={handleTeacherChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <input name="phone" value={teacherForm.phone} onChange={handleTeacherChange} placeholder="Teacher mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>

                <textarea name="address" value={teacherForm.address} onChange={handleTeacherChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />

                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-violet-800">Assign Courses</p>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
                    {courses.length > 0 ? courses.map((course) => (
                      <label key={course._id} className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={teacherForm.taughtCourses.includes(course._id)}
                          onChange={() => handleTeacherCourseToggle(course._id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span>
                          <span className="block font-semibold text-slate-800">{course.title}</span>
                          <span className="block text-xs text-slate-500">{course.duration || 'Duration pending'} {course.feeAmount !== undefined ? `• Rs ${course.feeAmount}` : ''}</span>
                        </span>
                      </label>
                    )) : (
                      <p className="text-sm text-slate-500">No course records available to assign yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                  This teacher will log in from the secure staff portal at <span className="font-semibold">`/portal-8a9d3f2c`</span>.
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button type="button" onClick={closeTeacherModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Teacher'}
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
