const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic-plus';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Admin',
      email: 'admin@academicplus.com',
      password: adminPassword,
      role: 'admin',
    });
    // Use direct save to avoid pre-save hook double hashing
    await User.collection.insertOne({
      ...admin.toObject(),
      password: adminPassword
    });

    // Create Dummy Student
    const studentPassword = await bcrypt.hash('password', 10);
    const student = new User({
      name: 'Rohan Sharma',
      email: 'student@academicplus.com',
      password: studentPassword,
      role: 'student',
      studentId: 'STU1001',
      phone: '9876543210'
    });
    await User.collection.insertOne({
      ...student.toObject(),
      password: studentPassword
    });

    console.log('Database seeded successfully!');
    console.log('Admin: admin@academicplus.com / admin123');
    console.log('Student: student@academicplus.com / password');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
