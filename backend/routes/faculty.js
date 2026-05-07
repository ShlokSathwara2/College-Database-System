const router = require('express').Router();
const { getFaculty, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getFaculty);
router.post('/', authorize('admin'), createFaculty);
router.put('/:id', authorize('admin'), updateFaculty);
router.delete('/:id', authorize('admin'), deleteFaculty);

module.exports = router;
