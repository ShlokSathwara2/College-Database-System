const router = require('express').Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
