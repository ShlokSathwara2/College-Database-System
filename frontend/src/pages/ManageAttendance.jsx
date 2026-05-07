import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Save, CheckCircle } from 'lucide-react';

const ManageAttendance = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?limit=50');
        setCourses(res.data.data.filter(c => c.facultyName === user?.name));
      } catch (err) { console.error(err); }
    };
    fetchCourses();
  }, [user]);

  const fetchAttendance = async (courseID) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/course/${courseID}`);
      setAttendanceData(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCourseChange = (e) => {
    const courseID = e.target.value;
    setSelectedCourse(courseID);
    setSaved(false);
    if (courseID) fetchAttendance(courseID);
    else setAttendanceData([]);
  };

  const handlePercentageChange = (studentID, value) => {
    setAttendanceData(prev => prev.map(a =>
      a.studentID === studentID ? { ...a, percentage: parseFloat(value) || 0 } : a
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const payload = attendanceData.map(a => ({
        studentID: a.studentID, courseID: parseInt(selectedCourse), percentage: a.percentage,
      }));
      await api.put('/attendance', { attendance: payload });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Error saving attendance'); }
  };

  const getAttendanceColor = (pct) => {
    if (pct >= 90) return 'bg-emerald-500';
    if (pct >= 75) return 'bg-cyan-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Attendance</h1>
        <p className="text-dark-400 mt-1">Select a course and update attendance records</p>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-dark-300 mb-1">Select Course</label>
        <select value={selectedCourse} onChange={handleCourseChange} className="input-field">
          <option value="">Choose a course...</option>
          {courses.map(c => <option key={c.courseID} value={c.courseID}>{c.courseCode} — {c.courseName}</option>)}
        </select>
      </div>

      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>}

      {!loading && selectedCourse && attendanceData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Student</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Percentage</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase w-48">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {attendanceData.map((a) => (
                <tr key={a.studentID} className="hover:bg-dark-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{a.studentName}</td>
                  <td className="px-6 py-4 text-sm text-dark-300">{a.email}</td>
                  <td className="px-6 py-4">
                    <input type="number" min="0" max="100" step="0.5" value={a.percentage}
                      onChange={(e) => handlePercentageChange(a.studentID, e.target.value)}
                      className="w-24 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${getAttendanceColor(a.percentage)}`}
                          style={{ width: `${Math.min(a.percentage, 100)}%` }} />
                      </div>
                      <span className="text-xs text-dark-400 w-10 text-right">{a.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <div>{saved && <span className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={16} /> Attendance saved!</span>}</div>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={18} /> Save Attendance</button>
          </div>
        </div>
      )}

      {!loading && selectedCourse && attendanceData.length === 0 && (
        <div className="glass-card p-12 text-center"><p className="text-dark-500">No students enrolled in this course.</p></div>
      )}
    </div>
  );
};

export default ManageAttendance;
