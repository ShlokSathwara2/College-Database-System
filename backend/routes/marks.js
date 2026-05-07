const router = require('express').Router();
const { getStudentMarks, getCourseMarks, updateMarks } = require('../controllers/marksController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/student/:studentID', getStudentMarks);
router.get('/course/:courseID', getCourseMarks);
router.put('/', authorize('admin', 'faculty'), updateMarks);

module.exports = router;
