const router = require('express').Router();
const { getStats, getDepartmentWise } = require('../controllers/dashboardController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/stats', authorize('admin'), getStats);
router.get('/department-wise', authorize('admin'), getDepartmentWise);

module.exports = router;
