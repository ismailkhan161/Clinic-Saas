const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');

const createPatient = async (req, res) => {
  const patient = await Patient.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(patient);
};

const getPatients = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { contact: { $regex: search, $options: 'i' } }];
  const skip = (page - 1) * limit;
  const [patients, total] = await Promise.all([
    Patient.find(query).populate('createdBy', 'name').skip(skip).limit(Number(limit)).sort('-createdAt'),
    Patient.countDocuments(query),
  ]);
  res.json({ patients, total, pages: Math.ceil(total / limit) });
};

const getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('createdBy', 'name');
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
};

const updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
};

const deletePatient = async (req, res) => {
  await Patient.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Patient deactivated' });
};

const getPatientHistory = async (req, res) => {
  const { id } = req.params;
  const [appointments, prescriptions, diagnosisLogs] = await Promise.all([
    Appointment.find({ patientId: id }).populate('doctorId', 'name specialization').sort('-date'),
    Prescription.find({ patientId: id }).populate('doctorId', 'name').sort('-createdAt'),
    DiagnosisLog.find({ patientId: id }).populate('doctorId', 'name').sort('-createdAt'),
  ]);
  res.json({ appointments, prescriptions, diagnosisLogs });
};

module.exports = { createPatient, getPatients, getPatient, updatePatient, deletePatient, getPatientHistory };