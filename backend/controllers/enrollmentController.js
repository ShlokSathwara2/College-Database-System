// ============================================================
// Enrollment Controller — Transactional enrollment operations
// ============================================================

const pool = require('../config/db');

const getEnrollments = async (req, res) => {
  try {
    const { studentID } = req.params;
    const [enrollments] = await pool.query(
      `SELECT e.studentID, e.courseID, e.enrolledAt, c.courseName, c.courseCode,
              c.credits, d.deptName, u.name as facultyName
       FROM enrollment e
       JOIN courses c ON e.courseID = c.courseID
       JOIN departments d ON c.deptID = d.deptID
       LEFT JOIN faculty f ON c.facultyID = f.facultyID
       LEFT JOIN users u ON f.userID = u.userID
       WHERE e.studentID = ?`,
      [studentID]
    );
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('GetEnrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * Transactional enrollment — uses COMMIT/ROLLBACK
 */
const enrollStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { studentID, courseID } = req.body;

    // Verify student exists
    const [student] = await conn.query('SELECT studentID FROM students WHERE studentID = ?', [studentID]);
    if (student.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Verify course exists
    const [course] = await conn.query('SELECT courseID FROM courses WHERE courseID = ?', [courseID]);
    if (course.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if already enrolled
    const [existing] = await conn.query(
      'SELECT * FROM enrollment WHERE studentID = ? AND courseID = ?', [studentID, courseID]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });
    }

    // Enroll
    await conn.query('INSERT INTO enrollment (studentID, courseID) VALUES (?, ?)', [studentID, courseID]);

    // Initialize marks and attendance records
    await conn.query('INSERT INTO marks (studentID, courseID, marks) VALUES (?, ?, 0)', [studentID, courseID]);
    await conn.query('INSERT INTO attendance (studentID, courseID, percentage) VALUES (?, ?, 0)', [studentID, courseID]);

    await conn.commit();
    res.status(201).json({ success: true, message: 'Student enrolled successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('EnrollStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

const unenrollStudent = async (req, res) => {
  try {
    const { studentID, courseID } = req.params;
    const [result] = await pool.query(
      'DELETE FROM enrollment WHERE studentID = ? AND courseID = ?', [studentID, courseID]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    res.json({ success: true, message: 'Student unenrolled.' });
  } catch (error) {
    console.error('UnenrollStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEnrollments, enrollStudent, unenrollStudent };
