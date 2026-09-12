const User = require('../models/User');
const Patient = require('../models/Patient');

const getUsers = async (req, res) => {
  const { role } = req.query;
  const query = {};
  if (role) query.role = role;
  const users = await User.find(query).select('-password').sort('-createdAt');
  res.json(users);
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateUser = async (req, res) => {
  const allowed = ['name', 'phone', 'specialization', 'isActive', 'subscriptionPlan'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
  if (user.role === 'patient') await Patient.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: `${user.name} permanently removed` });
};

const deactivateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `${user.name} deactivated`, user });
};

const activateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `${user.name} activated`, user });
};

// Update subscription plan
const updatePlan = async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'pro'].includes(plan)) return res.status(400).json({ message: 'Plan must be free or pro' });
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { subscriptionPlan: plan },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `${user.name} plan updated to ${plan}`, user });
};

const getDoctors = async (req, res) => {
  const doctors = await User.find({ role: 'doctor', isActive: true }).select('-password');
  res.json(doctors);
};

module.exports = { getUsers, getUser, updateUser, deleteUser, deactivateUser, activateUser, updatePlan, getDoctors };