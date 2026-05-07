// ============================================================
// Department Controller — CRUD operations
// ============================================================

const pool = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT d.*, COUNT(s.studentID) as studentCount FROM departments d LEFT JOIN students s ON d.deptID = s.deptID GROUP BY d.deptID ORDER BY d.deptName'
    );
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('GetDepartments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { deptName } = req.body;
    const [existing] = await pool.query('SELECT deptID FROM departments WHERE deptName = ?', [deptName]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Department already exists.' });
    }
    const [result] = await pool.query('INSERT INTO departments (deptName) VALUES (?)', [deptName]);
    res.status(201).json({ success: true, message: 'Department created.', data: { deptID: result.insertId, deptName } });
  } catch (error) {
    console.error('CreateDepartment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { deptName } = req.body;
    const [result] = await pool.query('UPDATE departments SET deptName = ? WHERE deptID = ?', [deptName, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.json({ success: true, message: 'Department updated.' });
  } catch (error) {
    console.error('UpdateDepartment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM departments WHERE deptID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.json({ success: true, message: 'Department deleted.' });
  } catch (error) {
    console.error('DeleteDepartment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
