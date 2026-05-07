// ============================================================
// Dashboard Controller — Aggregate stats & reports
// ============================================================

const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    const [[students]] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [[faculty]] = await pool.query('SELECT COUNT(*) as count FROM faculty');
    const [[courses]] = await pool.query('SELECT COUNT(*) as count FROM courses');
    const [[departments]] = await pool.query('SELECT COUNT(*) as count FROM departments');
    const [[enrollments]] = await pool.query('SELECT COUNT(*) as count FROM enrollment');

    res.json({
      success: true,
      data: {
        students: students.count,
        faculty: faculty.count,
        courses: courses.count,
        departments: departments.count,
        enrollments: enrollments.count,
      },
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getDepartmentWise = async (req, res) => {
  try {
    const [data] = await pool.query(
      `SELECT d.deptName, COUNT(s.studentID) as studentCount,
              COUNT(DISTINCT c.courseID) as courseCount
       FROM departments d
       LEFT JOIN students s ON d.deptID = s.deptID
       LEFT JOIN courses c ON d.deptID = c.deptID
       GROUP BY d.deptID, d.deptName
       ORDER BY d.deptName`
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error('GetDepartmentWise error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats, getDepartmentWise };
