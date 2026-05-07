const router = require('express').Router();
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getCourses);
router.post('/', authorize('admin'), createCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

module.exports = router;
