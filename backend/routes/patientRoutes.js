const router = require('express').Router();
const { createPatient, getPatients, getPatient, updatePatient, deletePatient, getPatientHistory } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/Auth');
router.use(protect);
router.route('/').get(getPatients).post(authorize('admin', 'receptionist', 'doctor'), createPatient);
router.route('/:id').get(getPatient).put(authorize('admin', 'receptionist', 'doctor'), updatePatient).delete(authorize('admin'), deletePatient);
router.get('/:id/history', getPatientHistory);
module.exports = router;