const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');
const User = require('../models/User');

const adminAnalytics = async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [totalPatients, totalDoctors, totalReceptionists, monthlyAppointments, totalAppointments, completedAppointments, recentPatients, appointmentsByStatus] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'doctor', isActive: true }),
    User.countDocuments({ role: 'receptionist', isActive: true }),
    Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'completed' }),
    Patient.find({ isActive: true }).sort('-createdAt').limit(5).select('name age gender createdAt'),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = await Appointment.countDocuments({ createdAt: { $gte: start, $lte: end } });
    monthlyData.push({ month: start.toLocaleString('default', { month: 'short' }), count });
  }

  const topDiagnoses = await DiagnosisLog.aggregate([
    { $unwind: '$aiResponse.possibleConditions' },
    { $group: { _id: '$aiResponse.possibleConditions', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 5 },
  ]);

  res.json({ totalPatients, totalDoctors, totalReceptionists, monthlyAppointments, totalAppointments, completedAppointments, recentPatients, appointmentsByStatus, monthlyData, topDiagnoses, revenue: { monthly: monthlyAppointments * 500, total: totalAppointments * 500 } });
};

const doctorAnalytics = async (req, res) => {
  const doctorId = req.user._id;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [todayAppointments, monthlyAppointments, totalPrescriptions, monthlyPrescriptions, completedToday] = await Promise.all([
    Appointment.countDocuments({ doctorId, date: { $gte: today, $lte: todayEnd } }),
    Appointment.countDocuments({ doctorId, createdAt: { $gte: startOfMonth } }),
    Prescription.countDocuments({ doctorId }),
    Prescription.countDocuments({ doctorId, createdAt: { $gte: startOfMonth } }),
    Appointment.countDocuments({ doctorId, status: 'completed', date: { $gte: today, $lte: todayEnd } }),
  ]);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const s = new Date(d); s.setHours(0, 0, 0, 0);
    const e = new Date(d); e.setHours(23, 59, 59, 999);
    const count = await Appointment.countDocuments({ doctorId, date: { $gte: s, $lte: e } });
    weeklyData.push({ day: d.toLocaleString('default', { weekday: 'short' }), count });
  }

  res.json({ todayAppointments, monthlyAppointments, totalPrescriptions, monthlyPrescriptions, completedToday, weeklyData });
};

module.exports = { adminAnalytics, doctorAnalytics };