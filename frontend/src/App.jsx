import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageFaculty from './pages/ManageFaculty';
import ManageCourses from './pages/ManageCourses';
import ManageDepartments from './pages/ManageDepartments';
import FacultyDashboard from './pages/FacultyDashboard';
import ManageMarks from './pages/ManageMarks';
import ManageAttendance from './pages/ManageAttendance';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourses from './pages/StudentCourses';
import StudentMarks from './pages/StudentMarks';
import StudentAttendance from './pages/StudentAttendance';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const redirectMap = { admin: '/admin', faculty: '/faculty', student: '/student' };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return children;
};

// Redirect logged-in users away from login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const redirectMap = { admin: '/admin', faculty: '/faculty', student: '/student' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="departments" element={<ManageDepartments />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><Layout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="marks" element={<ManageMarks />} />
            <Route path="attendance" element={<ManageAttendance />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="attendance" element={<StudentAttendance />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
