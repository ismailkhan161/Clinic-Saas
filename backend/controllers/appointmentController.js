const Appointment = require('../models/Appointment');

const createAppointment = async (req, res) => {
  const appointment = await Appointment.create({ ...req.body, bookedBy: req.user._id });
  await appointment.populate(['patientId', { path: 'doctorId', select: 'name specialization' }]);
  res.status(201).json(appointment);
};

const getAppointments = async (req, res) => {
  const { status, doctorId, date, page = 1, limit = 20 } = req.query;
  const query = {};
  if (req.user.role === 'doctor') query.doctorId = req.user._id;
  else if (doctorId) query.doctorId = doctorId;
  if (status) query.status = status;
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }
  const skip = (page - 1) * limit;
  const [appointments, total] = await Promise.all([
    Appointment.find(query).populate('patientId', 'name age gender contact').populate('doctorId', 'name specialization').skip(skip).limit(Number(limit)).sort('-date'),
    Appointment.countDocuments(query),
  ]);
  res.json({ appointments, total, pages: Math.ceil(total / limit) });
};

const getAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('patientId').populate('doctorId', 'name specialization phone');
  if (!appointment) return res.status(404).json({ message: 'Not found' });
  res.json(appointment);
};

const updateAppointment = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!appointment) return res.status(404).json({ message: 'Not found' });
  res.json(appointment);
};

const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
  res.json(appointment);
};

const getDoctorSchedule = async (req, res) => {
  const { doctorId, date } = req.query;
  const targetDoc = doctorId || req.user._id;
  const start = new Date(date || Date.now()); start.setHours(0, 0, 0, 0);
  const end = new Date(date || Date.now()); end.setHours(23, 59, 59, 999);
  const appointments = await Appointment.find({ doctorId: targetDoc, date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } }).populate('patientId', 'name age gender').sort('date');
  res.json(appointments);
};

module.exports = { createAppointment, getAppointments, getAppointment, updateAppointment, cancelAppointment, getDoctorSchedule };