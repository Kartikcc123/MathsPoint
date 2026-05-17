const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ').toLowerCase();
const normalizePhone = (value = '') => value.replace(/\D/g, '');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  normalizedName: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student', 'parent'], default: 'student', index: true },
  // Student specific fields
  studentId: { type: String, unique: true, sparse: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  parentName: { type: String, trim: true },
  parentEmail: { type: String },
  parentPhone: { type: String },
  phone: { type: String, trim: true },
  normalizedPhone: { type: String, unique: true, sparse: true },
  address: { type: String },
  city: { type: String, trim: true },
  academicClass: { type: String, trim: true },
  board: { type: String, trim: true },
  exams: { type: String, trim: true },
  language: { type: String, trim: true },
  avatar: { type: String, trim: true },
  linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  taughtCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // Allow admin to grant student panel access even without enrollment
  studentPanelAllowed: { type: Boolean, default: false },
  enrolledDate: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('validate', function () {
  if (this.isModified('name') || this.isNew) {
    this.name = this.name?.trim();
    this.normalizedName = this.name ? normalizeName(this.name) : undefined;
  }

  if (this.isModified('email') || this.isNew) {
    this.email = this.email?.trim().toLowerCase();
  }

  if (this.isModified('phone') || this.isNew) {
    this.phone = this.phone?.trim() || undefined;
    this.normalizedPhone = this.phone ? normalizePhone(this.phone) : undefined;
  }

  if (this.isModified('studentId') || this.isNew) {
    this.studentId = this.studentId?.trim() || undefined;
  }

  if (this.isModified('parentName') || this.isNew) {
    this.parentName = this.parentName?.trim() || undefined;
  }

  if (this.isModified('parentEmail') || this.isNew) {
    this.parentEmail = this.parentEmail?.trim().toLowerCase() || undefined;
  }

  if (this.isModified('parentPhone') || this.isNew) {
    this.parentPhone = this.parentPhone?.trim() || undefined;
  }

  if (this.isModified('address') || this.isNew) {
    this.address = this.address?.trim() || undefined;
  }

  if (this.role !== 'parent') {
    this.linkedStudents = [];
  }

  if (this.role !== 'teacher') {
    this.taughtCourses = [];
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ role: 1, course: 1 });
userSchema.index({ role: 1, linkedStudents: 1 });
userSchema.index({ role: 1, taughtCourses: 1 });

module.exports = mongoose.model('User', userSchema);
