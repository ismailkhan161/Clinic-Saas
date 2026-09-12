const router = require('express').Router();
const { getUsers, getUser, updateUser, deleteUser, deactivateUser, activateUser, updatePlan, getDoctors } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/doctors', getDoctors);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.put('/:id/plan', authorize('admin'), updatePlan);
router.put('/:id/deactivate', authorize('admin'), deactivateUser);
router.put('/:id/activate', authorize('admin'), activateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;