-- ============================================================
-- Seed Data for Centralized College Database System
-- Passwords are bcrypt hashes of 'password123'
-- ============================================================

USE college_db;

-- ============================================================
-- Users (password: 'password123' for all)
-- Hash: $2a$10$XQJG0Z1Z1Z1Z1Z1Z1Z1Z1uKJZ1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1
-- NOTE: Replace with actual bcrypt hash at runtime or use the
-- register API. The seed script below uses a placeholder.
-- ============================================================

-- Admin user
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Faculty users
INSERT INTO users (name, email, password, role) VALUES
('Dr. Rajesh Kumar', 'rajesh@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty'),
('Prof. Anita Sharma', 'anita@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty'),
('Dr. Suresh Patel', 'suresh@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty');

-- Student users
INSERT INTO users (name, email, password, role) VALUES
('Ayush Verma', 'ayush@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Priya Singh', 'priya@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Rahul Gupta', 'rahul@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Neha Joshi', 'neha@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Vikram Rao', 'vikram@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- ============================================================
-- Departments
-- ============================================================
INSERT INTO departments (deptName) VALUES
('Computer Science'),
('Electronics & Communication'),
('Mechanical Engineering'),
('Civil Engineering');

-- ============================================================
-- Students (linking users to departments)
-- ============================================================
INSERT INTO students (userID, deptID, enrollmentYear, phone) VALUES
(5, 1, 2024, '9876543210'),
(6, 1, 2024, '9876543211'),
(7, 2, 2023, '9876543212'),
(8, 3, 2024, '9876543213'),
(9, 2, 2023, '9876543214');

-- ============================================================
-- Faculty (linking users to departments)
-- ============================================================
INSERT INTO faculty (userID, deptID, subject, phone) VALUES
(2, 1, 'Data Structures & Algorithms', '9876500001'),
(3, 2, 'Digital Electronics', '9876500002'),
(4, 3, 'Thermodynamics', '9876500003');

-- ============================================================
-- Courses
-- ============================================================
INSERT INTO courses (courseName, courseCode, credits, deptID, facultyID) VALUES
('Data Structures', 'CS201', 4, 1, 1),
('Operating Systems', 'CS301', 4, 1, 1),
('Database Management Systems', 'CS302', 3, 1, 1),
('Digital Signal Processing', 'EC201', 4, 2, 2),
('VLSI Design', 'EC301', 3, 2, 2),
('Fluid Mechanics', 'ME201', 4, 3, 3),
('Heat Transfer', 'ME301', 3, 3, 3);

-- ============================================================
-- Enrollment
-- ============================================================
INSERT INTO enrollment (studentID, courseID) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 4), (3, 5),
(4, 6), (4, 7),
(5, 4), (5, 5);

-- ============================================================
-- Marks
-- ============================================================
INSERT INTO marks (studentID, courseID, marks) VALUES
(1, 1, 87.5), (1, 2, 92.0), (1, 3, 78.0),
(2, 1, 75.0), (2, 2, 68.5),
(3, 4, 88.0), (3, 5, 91.5),
(4, 6, 72.0), (4, 7, 85.0),
(5, 4, 79.5), (5, 5, 82.0);

-- ============================================================
-- Attendance
-- ============================================================
INSERT INTO attendance (studentID, courseID, percentage) VALUES
(1, 1, 95.0), (1, 2, 88.5), (1, 3, 92.0),
(2, 1, 78.0), (2, 2, 85.0),
(3, 4, 90.0), (3, 5, 87.5),
(4, 6, 82.0), (4, 7, 76.0),
(5, 4, 88.5), (5, 5, 91.0);
