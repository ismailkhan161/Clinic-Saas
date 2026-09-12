const router = require('express').Router();
const { adminAnalytics, doctorAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/admin', authorize('admin'), adminAnalytics);
router.get('/doctor', authorize('doctor'), doctorAnalytics);
module.exports = router;