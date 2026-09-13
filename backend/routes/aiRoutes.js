const router = require('express').Router();
const { symptomChecker, explainPrescription, riskFlagging, getTokenBalance, addTokens } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/Auth');

router.use(protect);
router.get('/tokens', getTokenBalance);
router.post('/tokens/add', authorize('admin'), addTokens);
router.post('/symptoms', authorize('doctor'), symptomChecker);
router.post('/explain', explainPrescription);
router.get('/risk/:patientId', authorize('doctor', 'admin'), riskFlagging);

module.exports = router;