const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'], required: true },
  phone: { type: String },
  specialization: { type: String },
  subscriptionPlan: { type: String, enum: ['free', 'pro'], default: 'free' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  aiTokens: { type: Number, default: 0 },
  aiTokensUsed: { type: Number, default: 0 },
}, { timestamps: true });

// FIXED: Removed 'next' parameter and calls since this is an async function
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // Just return to skip
  
  this.password = await bcrypt.hash(this.password, 10);
  // Mongoose automatically moves forward when this async function finishes executing
});

// OPTIMIZED: Handled token distribution dynamically without calling findByIdAndUpdate
userSchema.pre('save', function () {
  // Check if it is a brand new user document
  if (this.isNew && this.aiTokens === 0 && this.role !== 'admin' && this.role !== 'receptionist') {
    const tokenMap = { doctor: 10, patient: 3 };
    this.aiTokens = tokenMap[this.role] || 0;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

userSchema.methods.hasAITokens = function () {
  if (this.subscriptionPlan === 'pro') return true;
  return (this.aiTokens || 0) > 0;
};

userSchema.methods.useAIToken = async function () {
  if (this.subscriptionPlan === 'pro') return true;
  if ((this.aiTokens || 0) <= 0) return false;
  
  // Directly update this instance and save to keep DB in sync
  this.aiTokens -= 1;
  this.aiTokensUsed += 1;
  await this.save();
  return true;
};

module.exports = mongoose.model('User', userSchema);
