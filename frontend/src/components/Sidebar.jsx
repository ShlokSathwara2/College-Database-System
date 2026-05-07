import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Building2,
  ClipboardList, BarChart3, LogOut, ChevronLeft, Menu, UserCircle
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/admin/faculty', icon: Users, label: 'Faculty' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
  ];

  const facultyLinks = [
    { to: '/faculty', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/faculty/marks', icon: ClipboardList, label: 'Manage Marks' },
    { to: '/faculty/attendance', icon: BarChart3, label: 'Attendance' },
  ];

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/marks', icon: ClipboardList, label: 'My Marks' },
    { to: '/student/attendance', icon: BarChart3, label: 'My Attendance' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'faculty' ? facultyLinks
    : studentLinks;

  const roleLabel = user?.role === 'admin' ? 'Administrator'
    : user?.role === 'faculty' ? 'Faculty Member'
    : 'Student';

  return (
    <aside className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              CollegeDB
            </h1>
            <p className="text-xs text-dark-500 mt-0.5">Management System</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <link.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-3 border-t border-dark-700/50 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 animate-fade-in">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <UserCircle size={20} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
              <p className="text-xs text-dark-500">{roleLabel}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
