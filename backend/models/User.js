import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    default: null,
    sparse: true,
  },
  avatar: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  addresses: [{
    district: String,
    sector: String,
    street: String,
    isDefault: { type: Boolean, default: false }
  }],
  preferences: {
    currency: { type: String, default: 'RWF' },
    language: { type: String, default: 'English' },
    theme: { type: String, enum: ['Light', 'Dark'], default: 'Light' }
  },
  notifications: {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newArrivals: { type: Boolean, default: true },
    priceDrops: { type: Boolean, default: true },
    methods: {
      sms: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationExpire: Date,
  resetPasswordCode: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Generate and hash password code
userSchema.methods.getResetPasswordCode = function() {
  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash code and set to resetPasswordCode field
  this.resetPasswordCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

const User = mongoose.model('User', userSchema);
export default User;

