const router = require('express').Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getDepartments);
router.post('/', authorize('admin'), createDepartment);
router.put('/:id', authorize('admin'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
