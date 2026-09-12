const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Register
const register = async (req, res) => {
  const { name, email, password, role, phone, specialization } = req.body;

  // Prevent admin self-registration
  if (role === 'admin') return res.status(403).json({ message: 'Admin registration is not allowed' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role, phone, specialization });

  // If registering as patient, also create a Patient record automatically
  if (role === 'patient') {
    await Patient.create({
      name: user.name,
      age: req.body.age || 0,
      gender: req.body.gender || 'male',
      contact: phone || email,
      email: email,
      userId: user._id,
      createdBy: user._id,
    });
  }

  res.status(201).json({ user, token: generateToken(user._id) });
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive)
    return res.status(401).json({ message: 'Your account has been deactivated. Contact admin.' });
  res.json({ user, token: generateToken(user._id) });
};

// Get me
const getMe = async (req, res) => res.json(req.user);

// Update profile
const updateProfile = async (req, res) => {
  const { name, phone, specialization, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, specialization, avatar }, { new: true, runValidators: true });
  res.json(user);
};

// Forgot password - generate reset token
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'No account found with this email' });

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  // In production you'd send email. For now return token directly.
  res.json({
    message: 'Password reset token generated',
    resetToken, // In production: send via email only
    note: 'Use this token to reset your password at /api/auth/reset-password'
  });
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful! Please login with your new password.' });
};

// Change password (when logged in)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword)))
    return res.status(401).json({ message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword, changePassword };