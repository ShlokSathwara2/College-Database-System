const router = require('express').Router();
const { getStudentAttendance, getCourseAttendance, updateAttendance } = require('../controllers/attendanceController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/student/:studentID', getStudentAttendance);
router.get('/course/:courseID', getCourseAttendance);
router.put('/', authorize('admin', 'faculty'), updateAttendance);

module.exports = router;
