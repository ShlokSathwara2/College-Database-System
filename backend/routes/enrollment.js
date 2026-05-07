const router = require('express').Router();
const { getEnrollments, enrollStudent, unenrollStudent } = require('../controllers/enrollmentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/:studentID', getEnrollments);
router.post('/', authorize('admin', 'faculty'), enrollStudent);
router.delete('/:studentID/:courseID', authorize('admin'), unenrollStudent);

module.exports = router;
