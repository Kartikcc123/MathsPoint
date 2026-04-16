import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, Receipt, Search, Wallet, CalendarDays, FileText } from 'lucide-react';
import api from '../../services/api';

const statusClasses = {
  Paid: 'border border-green-100 bg-green-50 text-green-700',
  Partial: 'border border-amber-100 bg-amber-50 text-amber-700',
  Unpaid: 'border border-red-100 bg-red-50 text-red-700',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/payments');
        setPayments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payment records.');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;

    return payments.filter((payment) =>
      [
        payment.studentId?.name,
        payment.studentId?.email,
        payment.studentId?.studentId,
        payment.studentId?.course?.title,
        payment.month,
        payment.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [payments, search]);

  const totalCollected = useMemo(
    () => payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const pendingCount = useMemo(
    () => payments.filter((payment) => payment.status !== 'Paid').length,
    [payments]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Receipt className="h-6 w-6 text-emerald-600" /> Payment Records
          </h2>
          <p className="mt-1 text-slate-500">Track every student payment record from one admin ledger.</p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student, email, course, month..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Payment entries</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{payments.length}</p>
          <p className="mt-2 text-sm text-slate-500">All student fee records currently stored</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Collected amount</p>
          <p className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-800">
            <IndianRupee className="h-6 w-6 text-emerald-600" /> {totalCollected}
          </p>
          <p className="mt-2 text-sm text-emerald-600">Based on records marked as paid</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Pending follow-up</p>
          <p className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-800">
            <Wallet className="h-6 w-6 text-amber-500" /> {pendingCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">Unpaid and partial payment records</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Month</th>
                <th className="px-6 py-4 font-semibold">Due / Paid</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredPayments.length ? filteredPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{payment.studentId?.name || 'Unknown student'}</p>
                    <p className="text-xs text-slate-500">{payment.studentId?.studentId || 'No ID'} • {payment.studentId?.email || 'No email'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{payment.studentId?.course?.title || 'No course assigned'}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{payment.month}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                      <p>Paid: {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'Not paid yet'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">Rs {payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[payment.status] || statusClasses.Unpaid}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.receiptUrl ? (
                      <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:text-blue-800">
                        <FileText className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-slate-300">No receipt</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-14 text-center text-slate-500">
                    {loading ? 'Loading payment records...' : 'No payment records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
