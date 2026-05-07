-- ============================================================
-- Centralized College Database System — Schema
-- Normalized to 3NF/BCNF
-- MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

-- ============================================================
-- 1. USERS — Authentication table (single login for all roles)
-- ============================================================
CREATE TABLE users (
    userID      INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,           -- bcrypt hash
    role        ENUM('admin', 'faculty', 'student') NOT NULL DEFAULT 'student',
    createdAt   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
    deptID      INT AUTO_INCREMENT PRIMARY KEY,
    deptName    VARCHAR(100) NOT NULL UNIQUE,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. STUDENTS — Linked to users and departments
-- ============================================================
CREATE TABLE students (
    studentID   INT AUTO_INCREMENT PRIMARY KEY,
    userID      INT          NOT NULL UNIQUE,
    deptID      INT          NOT NULL,
    enrollmentYear INT       NOT NULL,
    phone       VARCHAR(15),

    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (deptID) REFERENCES departments(deptID) ON DELETE CASCADE,

    INDEX idx_students_dept (deptID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. FACULTY — Linked to users and departments
-- ============================================================
CREATE TABLE faculty (
    facultyID   INT AUTO_INCREMENT PRIMARY KEY,
    userID      INT          NOT NULL UNIQUE,
    deptID      INT          NOT NULL,
    subject     VARCHAR(100) NOT NULL,
    phone       VARCHAR(15),

    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (deptID) REFERENCES departments(deptID) ON DELETE CASCADE,

    INDEX idx_faculty_dept (deptID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. COURSES — Belongs to a department, taught by a faculty
-- ============================================================
CREATE TABLE courses (
    courseID     INT AUTO_INCREMENT PRIMARY KEY,
    courseName  VARCHAR(100)  NOT NULL,
    courseCode   VARCHAR(20)   NOT NULL UNIQUE,
    credits     INT           NOT NULL DEFAULT 3,
    deptID      INT           NOT NULL,
    facultyID   INT,                                -- nullable if faculty leaves

    FOREIGN KEY (deptID)    REFERENCES departments(deptID) ON DELETE CASCADE,
    FOREIGN KEY (facultyID) REFERENCES faculty(facultyID) ON DELETE SET NULL,

    INDEX idx_courses_dept    (deptID),
    INDEX idx_courses_faculty (facultyID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. ENROLLMENT — Many-to-many between students and courses
-- ============================================================
CREATE TABLE enrollment (
    studentID   INT NOT NULL,
    courseID     INT NOT NULL,
    enrolledAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (studentID, courseID),
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseID)  REFERENCES courses(courseID)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. MARKS — Per student per course
-- ============================================================
CREATE TABLE marks (
    studentID   INT NOT NULL,
    courseID     INT NOT NULL,
    marks       DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (marks >= 0 AND marks <= 100),

    PRIMARY KEY (studentID, courseID),
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseID)  REFERENCES courses(courseID)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. ATTENDANCE — Per student per course (percentage)
-- ============================================================
CREATE TABLE attendance (
    studentID   INT NOT NULL,
    courseID     INT NOT NULL,
    percentage  DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),

    PRIMARY KEY (studentID, courseID),
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseID)  REFERENCES courses(courseID)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
