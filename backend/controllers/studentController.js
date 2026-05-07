// ============================================================
// Student Controller — CRUD with pagination & search
// ============================================================

const pool = require('../config/db');

/**
 * @desc    Get all students with pagination and search
 * @route   GET /api/students?page=1&limit=10&search=term
 */
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE u.name LIKE ? OR u.email LIKE ? OR d.deptName LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM students s
       JOIN users u ON s.userID = u.userID
       JOIN departments d ON s.deptID = d.deptID
       ${whereClause}`,
      params
    );

    // Get paginated results
    const [students] = await pool.query(
      `SELECT s.studentID, u.userID, u.name, u.email, s.deptID, d.deptName,
              s.enrollmentYear, s.phone, u.createdAt
       FROM students s
       JOIN users u ON s.userID = u.userID
       JOIN departments d ON s.deptID = d.deptID
       ${whereClause}
       ORDER BY s.studentID DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error('GetStudents error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 */
const getStudent = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.studentID, u.userID, u.name, u.email, s.deptID, d.deptName,
              s.enrollmentYear, s.phone, u.createdAt
       FROM students s
       JOIN users u ON s.userID = u.userID
       JOIN departments d ON s.deptID = d.deptID
       WHERE s.studentID = ?`,
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, data: students[0] });
  } catch (error) {
    console.error('GetStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Create a new student (creates user + student record)
 * @route   POST /api/students
 */
const createStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, email, password, deptID, enrollmentYear, phone } = req.body;
    const bcrypt = require('bcryptjs');

    // Check for existing email
    const [existing] = await conn.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'student']
    );

    // Create student profile
    const [studentResult] = await conn.query(
      'INSERT INTO students (userID, deptID, enrollmentYear, phone) VALUES (?, ?, ?, ?)',
      [userResult.insertId, deptID, enrollmentYear || new Date().getFullYear(), phone || null]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: { studentID: studentResult.insertId, userID: userResult.insertId },
    });
  } catch (error) {
    await conn.rollback();
    console.error('CreateStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 */
const updateStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, email, deptID, enrollmentYear, phone } = req.body;

    // Get student's userID
    const [student] = await conn.query('SELECT userID FROM students WHERE studentID = ?', [req.params.id]);
    if (student.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Update user info
    if (name || email) {
      const updates = [];
      const values = [];
      if (name) { updates.push('name = ?'); values.push(name); }
      if (email) { updates.push('email = ?'); values.push(email); }
      values.push(student[0].userID);
      await conn.query(`UPDATE users SET ${updates.join(', ')} WHERE userID = ?`, values);
    }

    // Update student info
    const studentUpdates = [];
    const studentValues = [];
    if (deptID) { studentUpdates.push('deptID = ?'); studentValues.push(deptID); }
    if (enrollmentYear) { studentUpdates.push('enrollmentYear = ?'); studentValues.push(enrollmentYear); }
    if (phone !== undefined) { studentUpdates.push('phone = ?'); studentValues.push(phone); }

    if (studentUpdates.length > 0) {
      studentValues.push(req.params.id);
      await conn.query(`UPDATE students SET ${studentUpdates.join(', ')} WHERE studentID = ?`, studentValues);
    }

    await conn.commit();
    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('UpdateStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

/**
 * @desc    Delete student (cascades to user)
 * @route   DELETE /api/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT userID FROM students WHERE studentID = ?', [req.params.id]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Deleting user cascades to student record
    await pool.query('DELETE FROM users WHERE userID = ?', [student[0].userID]);

    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('DeleteStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
