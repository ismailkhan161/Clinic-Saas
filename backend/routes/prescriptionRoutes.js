const router = require('express').Router();
const { createPrescription, getPrescriptions, getPrescription, updatePrescription, downloadPrescriptionPDF } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getPrescriptions).post(authorize('doctor'), createPrescription);
router.route('/:id').get(getPrescription).put(authorize('doctor'), updatePrescription);
router.get('/:id/pdf', downloadPrescriptionPDF);
module.exports = router;