const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
});

// Create Order API
router.post('/create-order', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const amount = course.feeAmount * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in database
    const newOrder = new Order({
      studentId: req.user._id,
      courseId: course._id,
      amount: course.feeAmount,
      razorpayOrderId: razorpayOrder.id,
      status: 'Created'
    });

    await newOrder.save();

    res.json({
      success: true,
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback_key'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Verify Payment API
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.status = 'Success';
      await order.save();

      // Automatically assign course to student
      const user = await User.findById(req.user._id);
      
      // Ensure enrolledCourses exists
      if (!user.enrolledCourses) {
        user.enrolledCourses = [];
      }
      
      // Add course if not already enrolled
      if (!user.enrolledCourses.includes(order.courseId)) {
        user.enrolledCourses.push(order.courseId);
        
        // Also set legacy 'course' field if it's empty
        if (!user.course) {
           user.course = order.courseId;
        }
        await user.save();
      }

      res.json({ success: true, message: 'Payment verified successfully. Course unlocked.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
