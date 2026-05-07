// ============================================================
// Faculty Controller — CRUD operations
// ============================================================

const pool = require('../config/db');

/**
 * @desc    Get all faculty with search
 * @route   GET /api/faculty?search=term
 */
const getFaculty = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE u.name LIKE ? OR f.subject LIKE ? OR d.deptName LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM faculty f
       JOIN users u ON f.userID = u.userID
       JOIN departments d ON f.deptID = d.deptID
       ${whereClause}`,
      params
    );

    const [faculty] = await pool.query(
      `SELECT f.facultyID, u.userID, u.name, u.email, f.deptID, d.deptName,
              f.subject, f.phone, u.createdAt
       FROM faculty f
       JOIN users u ON f.userID = u.userID
       JOIN departments d ON f.deptID = d.deptID
       ${whereClause}
       ORDER BY f.facultyID DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: faculty,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error('GetFaculty error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Create faculty (creates user + faculty record)
 * @route   POST /api/faculty
 */
const createFaculty = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, email, password, deptID, subject, phone } = req.body;
    const bcrypt = require('bcryptjs');

    const [existing] = await conn.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'faculty']
    );

    const [facultyResult] = await conn.query(
      'INSERT INTO faculty (userID, deptID, subject, phone) VALUES (?, ?, ?, ?)',
      [userResult.insertId, deptID, subject, phone || null]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully.',
      data: { facultyID: facultyResult.insertId, userID: userResult.insertId },
    });
  } catch (error) {
    await conn.rollback();
    console.error('CreateFaculty error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

/**
 * @desc    Update faculty
 * @route   PUT /api/faculty/:id
 */
const updateFaculty = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, email, deptID, subject, phone } = req.body;

    const [fac] = await conn.query('SELECT userID FROM faculty WHERE facultyID = ?', [req.params.id]);
    if (fac.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    if (name || email) {
      const updates = [];
      const values = [];
      if (name) { updates.push('name = ?'); values.push(name); }
      if (email) { updates.push('email = ?'); values.push(email); }
      values.push(fac[0].userID);
      await conn.query(`UPDATE users SET ${updates.join(', ')} WHERE userID = ?`, values);
    }

    const facUpdates = [];
    const facValues = [];
    if (deptID) { facUpdates.push('deptID = ?'); facValues.push(deptID); }
    if (subject) { facUpdates.push('subject = ?'); facValues.push(subject); }
    if (phone !== undefined) { facUpdates.push('phone = ?'); facValues.push(phone); }

    if (facUpdates.length > 0) {
      facValues.push(req.params.id);
      await conn.query(`UPDATE faculty SET ${facUpdates.join(', ')} WHERE facultyID = ?`, facValues);
    }

    await conn.commit();
    res.json({ success: true, message: 'Faculty updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('UpdateFaculty error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

/**
 * @desc    Delete faculty
 * @route   DELETE /api/faculty/:id
 */
const deleteFaculty = async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT userID FROM faculty WHERE facultyID = ?', [req.params.id]);
    if (fac.length === 0) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    await pool.query('DELETE FROM users WHERE userID = ?', [fac[0].userID]);
    res.json({ success: true, message: 'Faculty deleted successfully.' });
  } catch (error) {
    console.error('DeleteFaculty error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getFaculty, createFaculty, updateFaculty, deleteFaculty };
