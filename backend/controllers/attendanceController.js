// ============================================================
// Attendance Controller — Manage attendance percentages
// ============================================================

const pool = require('../config/db');

const getStudentAttendance = async (req, res) => {
  try {
    const [attendance] = await pool.query(
      `SELECT a.studentID, a.courseID, a.percentage, c.courseName, c.courseCode
       FROM attendance a JOIN courses c ON a.courseID = c.courseID
       WHERE a.studentID = ?`, [req.params.studentID]
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('GetStudentAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCourseAttendance = async (req, res) => {
  try {
    const [attendance] = await pool.query(
      `SELECT a.studentID, a.courseID, a.percentage, u.name as studentName, u.email
       FROM attendance a
       JOIN students s ON a.studentID = s.studentID
       JOIN users u ON s.userID = u.userID
       WHERE a.courseID = ?
       ORDER BY u.name`, [req.params.courseID]
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('GetCourseAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateAttendance = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { attendance } = req.body; // Array of { studentID, courseID, percentage }

    for (const entry of attendance) {
      if (entry.percentage < 0 || entry.percentage > 100) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Percentage must be between 0 and 100.' });
      }
      await conn.query(
        'INSERT INTO attendance (studentID, courseID, percentage) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE percentage = ?',
        [entry.studentID, entry.courseID, entry.percentage, entry.percentage]
      );
    }

    await conn.commit();
    res.json({ success: true, message: 'Attendance updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('UpdateAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

module.exports = { getStudentAttendance, getCourseAttendance, updateAttendance };
