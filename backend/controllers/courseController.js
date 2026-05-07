// ============================================================
// Course Controller — CRUD operations
// ============================================================

const pool = require('../config/db');

const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    if (search) {
      whereClause = 'WHERE c.courseName LIKE ? OR c.courseCode LIKE ? OR d.deptName LIKE ?';
      const s = `%${search}%`;
      params = [s, s, s];
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM courses c
       JOIN departments d ON c.deptID = d.deptID
       LEFT JOIN faculty f ON c.facultyID = f.facultyID
       LEFT JOIN users u ON f.userID = u.userID ${whereClause}`, params
    );

    const [courses] = await pool.query(
      `SELECT c.courseID, c.courseName, c.courseCode, c.credits, c.deptID,
              d.deptName, c.facultyID, u.name as facultyName
       FROM courses c
       JOIN departments d ON c.deptID = d.deptID
       LEFT JOIN faculty f ON c.facultyID = f.facultyID
       LEFT JOIN users u ON f.userID = u.userID
       ${whereClause} ORDER BY c.courseID DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true, data: courses,
      pagination: { page, limit, total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / limit) },
    });
  } catch (error) {
    console.error('GetCourses error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, credits, deptID, facultyID } = req.body;
    const [existing] = await pool.query('SELECT courseID FROM courses WHERE courseCode = ?', [courseCode]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Course code already exists.' });

    const [result] = await pool.query(
      'INSERT INTO courses (courseName, courseCode, credits, deptID, facultyID) VALUES (?, ?, ?, ?, ?)',
      [courseName, courseCode, credits || 3, deptID, facultyID || null]
    );
    res.status(201).json({ success: true, message: 'Course created.', data: { courseID: result.insertId } });
  } catch (error) {
    console.error('CreateCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseName, courseCode, credits, deptID, facultyID } = req.body;
    const updates = [];
    const values = [];
    if (courseName) { updates.push('courseName = ?'); values.push(courseName); }
    if (courseCode) { updates.push('courseCode = ?'); values.push(courseCode); }
    if (credits) { updates.push('credits = ?'); values.push(credits); }
    if (deptID) { updates.push('deptID = ?'); values.push(deptID); }
    if (facultyID !== undefined) { updates.push('facultyID = ?'); values.push(facultyID); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE courses SET ${updates.join(', ')} WHERE courseID = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course updated.' });
  } catch (error) {
    console.error('UpdateCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE courseID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course deleted.' });
  } catch (error) {
    console.error('DeleteCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
