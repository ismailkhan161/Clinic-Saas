const router = require('express').Router();
const { createAppointment, getAppointments, getAppointment, updateAppointment, cancelAppointment, getDoctorSchedule } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/schedule', getDoctorSchedule);
router.route('/').get(getAppointments).post(authorize('admin', 'receptionist', 'patient'), createAppointment);
router.route('/:id').get(getAppointment).put(authorize('admin', 'receptionist', 'doctor'), updateAppointment);
router.put('/:id/cancel', cancelAppointment);
module.exports = router;