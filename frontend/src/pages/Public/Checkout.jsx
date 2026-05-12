import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Redirect to login, but pass the current checkout URL so they come back after logging in
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await api.get('/public/courses');
        const found = res.data.find(c => c._id === courseId);
        if (found) {
          setCourse(found);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, navigate, location.pathname]);

  const handlePayment = async () => {
    if (!course) return;
    setProcessing(true);
    setError('');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      // Create order from backend
      const { data: orderData } = await api.post('/payments/create-order', { courseId: course._id });
      
      if (!orderData.success) {
        setError('Failed to initialize payment.');
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MathsPoint Institute',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Redirect to student dashboard
              navigate('/student/courses', { state: { paymentSuccess: true } });
            } else {
              setError('Payment verification failed. If money was deducted, please contact support.');
            }
          } catch (err) {
            console.error(err);
            setError('Payment verification error.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#0ea5e9' // sky-500
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description);
      });
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError('An error occurred during checkout.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <h2 className="text-2xl font-bold text-slate-800">{error}</h2>
        <button onClick={() => navigate('/courses')} className="mt-4 text-sky-600 underline">Back to Courses</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
            <p className="mt-2 text-slate-400">Complete your purchase to unlock instant access.</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/50 p-6">
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Program Selected</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{course.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-slate-900">₹{course.feeAmount}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-5 w-5 text-sky-500" /> Instant online access to course materials
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-5 w-5 text-sky-500" /> Track progress via Student Dashboard
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 px-6 text-lg font-bold text-white transition hover:bg-sky-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                {processing ? 'Processing...' : `Pay Securely ₹${course.feeAmount}`}
              </button>
              <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                Payments are securely processed by Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
