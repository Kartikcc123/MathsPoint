import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, FileText, Wallet, ExternalLink, Smartphone, Landmark, X, LoaderCircle } from 'lucide-react';
import api from '../../services/api';

const statusClasses = {
  Paid: 'border border-green-100 bg-green-50 text-green-700',
  Partial: 'border border-amber-100 bg-amber-50 text-amber-700',
  Unpaid: 'border border-red-100 bg-red-50 text-red-700',
};

const paymentMethods = [
  { value: 'UPI', label: 'UPI', icon: Smartphone, helper: 'Use your UPI app and enter the transaction reference.' },
  { value: 'Net Banking', label: 'Net Banking', icon: Landmark, helper: 'Complete bank payment and enter the bank reference.' },
];

const initialPaymentForm = {
  method: 'UPI',
  reference: '',
  note: '',
};

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [submitting, setSubmitting] = useState(false);

  const loadPayments = async () => {
    try {
      setError('');
      const res = await api.get('/student/payments');
      setFees(res.data || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Failed to load payment records.');
      console.error('Failed to load fees', loadError);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const outstandingFees = fees.filter((fee) => fee.status !== 'Paid');
  const totalOutstanding = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0);
  const latestOutstanding = useMemo(() => outstandingFees[0] || null, [outstandingFees]);

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentForm(initialPaymentForm);
    setError('');
    setSuccess('');
  };

  const closePaymentModal = () => {
    setSelectedFee(null);
    setPaymentForm(initialPaymentForm);
    setSubmitting(false);
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentForm((current) => ({ ...current, [name]: value }));
  };

  const handlePayNow = async (event) => {
    event.preventDefault();
    if (!selectedFee) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const payload = {
        method: paymentForm.method,
        reference: paymentForm.reference.trim(),
        note: paymentForm.note.trim(),
      };

      const res = await api.post(`/student/payments/${selectedFee._id}/pay`, payload);
      const updatedFee = res.data;

      setFees((current) => current.map((fee) => (fee._id === updatedFee._id ? updatedFee : fee)));
      setSuccess(`Payment recorded successfully through ${updatedFee.paymentMethod}.`);
      closePaymentModal();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to complete payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
        <p className="mt-1 text-slate-500">Pay your course fees through UPI or Net Banking and keep your payment history in one place.</p>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 transform opacity-10">
            <IndianRupee className="h-48 w-48" />
          </div>
          <h3 className="relative z-10 mb-2 font-medium text-blue-100">Total Outstanding Dues</h3>
          <div className="relative z-10 mb-6 text-5xl font-bold">Rs {totalOutstanding}</div>
          <p className="relative z-10 mb-8 text-sm text-blue-100">
            {latestOutstanding ? `${latestOutstanding.month} is currently marked as ${latestOutstanding.status}.` : 'No outstanding fees at the moment.'}
          </p>
          {latestOutstanding ? (
            <button
              type="button"
              onClick={() => openPaymentModal(latestOutstanding)}
              className="relative z-10 rounded-2xl bg-white px-8 py-3 font-bold text-blue-600 shadow-md transition hover:bg-slate-50"
            >
              Pay Latest Due
            </button>
          ) : (
            <div className="relative z-10 inline-flex rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white/90">
              All fees are clear
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Status</p>
              <h3 className="text-lg font-bold text-slate-800">{outstandingFees.length ? `${outstandingFees.length} pending payment(s)` : 'All clear'}</h3>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Only your own records are shown here. Payment method, reference number, and paid date are saved after each payment.
          </p>
        </div>
      </div>

      <section>
        <h3 className="mb-6 text-xl font-bold text-slate-800">Payment History</h3>
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
              <thead className="border-b border-slate-50 bg-slate-50/50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Month</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Payment Mode</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length ? fees.map((fee) => (
                  <tr key={fee._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{fee.month}</td>
                    <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Rs {fee.amount}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-700">{fee.paymentMethod || 'Not paid yet'}</p>
                        <p className="text-xs text-slate-500">{fee.paymentReference || 'Reference pending'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[fee.status] || statusClasses.Unpaid}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {fee.status !== 'Paid' ? (
                        <button
                          type="button"
                          onClick={() => openPaymentModal(fee)}
                          className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Pay Now
                        </button>
                      ) : fee.receiptUrl ? (
                        <a href={fee.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-slate-400">
                          <FileText className="h-4 w-4" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center text-slate-500">
                      No fee records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Pay Course Fee</h3>
                <p className="text-sm text-slate-500">{selectedFee.month} • Rs {selectedFee.amount}</p>
              </div>
              <button type="button" onClick={closePaymentModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePayNow} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map(({ value, label, icon: Icon, helper }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-[24px] border p-5 transition ${paymentForm.method === value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={value}
                      checked={paymentForm.method === value}
                      onChange={handlePaymentChange}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className={`rounded-2xl p-3 ${paymentForm.method === value ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{label}</p>
                        <p className="mt-1 text-sm text-slate-500">{helper}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {paymentForm.method === 'UPI'
                  ? 'Suggested flow: open your UPI app, pay the amount, then paste the UPI transaction reference below.'
                  : 'Suggested flow: complete the payment from your bank portal, then enter the bank transaction reference below.'}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="reference"
                  value={paymentForm.reference}
                  onChange={handlePaymentChange}
                  placeholder={paymentForm.method === 'UPI' ? 'UPI transaction reference' : 'Bank transaction reference'}
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={`Rs ${selectedFee.amount}`}
                  disabled
                  className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                />
              </div>

              <textarea
                name="note"
                value={paymentForm.note}
                onChange={handlePaymentChange}
                rows="3"
                placeholder="Optional note"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Processing...' : `Pay via ${paymentForm.method}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
