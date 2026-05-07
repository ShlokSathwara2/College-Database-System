// ============================================================
// Marks Controller — Transactional marks management
// ============================================================

const pool = require('../config/db');

const getStudentMarks = async (req, res) => {
  try {
    const [marks] = await pool.query(
      `SELECT m.studentID, m.courseID, m.marks, c.courseName, c.courseCode, c.credits
       FROM marks m JOIN courses c ON m.courseID = c.courseID
       WHERE m.studentID = ?`, [req.params.studentID]
    );
    res.json({ success: true, data: marks });
  } catch (error) {
    console.error('GetStudentMarks error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCourseMarks = async (req, res) => {
  try {
    const [marks] = await pool.query(
      `SELECT m.studentID, m.courseID, m.marks, u.name as studentName, u.email
       FROM marks m
       JOIN students s ON m.studentID = s.studentID
       JOIN users u ON s.userID = u.userID
       WHERE m.courseID = ?
       ORDER BY u.name`, [req.params.courseID]
    );
    res.json({ success: true, data: marks });
  } catch (error) {
    console.error('GetCourseMarks error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * Transactional marks update — batch update for a course
 */
const updateMarks = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { marks } = req.body; // Array of { studentID, courseID, marks }

    for (const entry of marks) {
      // Validate enrollment
      const [enrolled] = await conn.query(
        'SELECT * FROM enrollment WHERE studentID = ? AND courseID = ?',
        [entry.studentID, entry.courseID]
      );
      if (enrolled.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Student ${entry.studentID} is not enrolled in course ${entry.courseID}.`,
        });
      }

      if (entry.marks < 0 || entry.marks > 100) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Marks must be between 0 and 100.' });
      }

      await conn.query(
        'INSERT INTO marks (studentID, courseID, marks) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE marks = ?',
        [entry.studentID, entry.courseID, entry.marks, entry.marks]
      );
    }

    await conn.commit();
    res.json({ success: true, message: 'Marks updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('UpdateMarks error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

module.exports = { getStudentMarks, getCourseMarks, updateMarks };
