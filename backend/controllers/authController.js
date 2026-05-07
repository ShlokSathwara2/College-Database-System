// ============================================================
// Auth Controller — Register, Login, Get Profile
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const [existing] = await pool.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'student']
    );

    // Generate JWT
    const token = jwt.sign(
      { userID: result.insertId, role: role || 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        userID: result.insertId,
        name,
        email,
        role: role || 'student',
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: {
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT userID, name, email, role, createdAt FROM users WHERE userID = ?',
      [req.user.userID]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let profileData = { ...user };

    // Attach role-specific profile data
    if (user.role === 'student') {
      const [students] = await pool.query(
        `SELECT s.studentID, s.deptID, s.enrollmentYear, s.phone, d.deptName
         FROM students s JOIN departments d ON s.deptID = d.deptID
         WHERE s.userID = ?`,
        [user.userID]
      );
      if (students.length > 0) profileData.profile = students[0];
    } else if (user.role === 'faculty') {
      const [faculty] = await pool.query(
        `SELECT f.facultyID, f.deptID, f.subject, f.phone, d.deptName
         FROM faculty f JOIN departments d ON f.deptID = d.deptID
         WHERE f.userID = ?`,
        [user.userID]
      );
      if (faculty.length > 0) profileData.profile = faculty[0];
    }

    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };
