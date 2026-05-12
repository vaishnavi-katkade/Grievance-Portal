const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const validDepartments = [
  "SHREEYASH COLLEGE OF ENGINEERING & TECHNOLOGY",
  "SHREEYASH COLLEGE OF ENGINEERING & TECHNOLOGY (POLYTECHNIC)",
  "SHREEYASH INSTITUTE OF PHARMACY",
  "SHREEYASH INSTITUTE OF PHARMACEUTICAL EDUCATION & RESEARCH",
  "SHREEYASH INSTITUTE OF MANAGEMENT STUDIES AND RESEARCH",
  "SHREEYASH AYURVEDIC COLLEGE AND HOSPITAL RESEARCH CENTER",
  "HR",
  "Admin",
  "Account"
];

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: false
  },
  otpExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    required: true
  },
  enrollment: {
    type: String,
    default: 'N/A'
  },
  name: {
    type: String,
    default: ''
  },
  department: { type: String, enum: validDepartments, default: null },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);