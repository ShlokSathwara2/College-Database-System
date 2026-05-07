import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { BookOpen, ClipboardList, BarChart3, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        const p = profileRes.data.data;
        setProfile(p);

        if (p.profile?.studentID) {
          const [coursesRes, marksRes, attRes] = await Promise.all([
            api.get(`/enrollment/${p.profile.studentID}`),
            api.get(`/marks/student/${p.profile.studentID}`),
            api.get(`/attendance/student/${p.profile.studentID}`),
          ]);
          setCourses(coursesRes.data.data);
          setMarks(marksRes.data.data);
          setAttendance(attRes.data.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const avgMarks = marks.length > 0 ? (marks.reduce((s, m) => s + parseFloat(m.marks), 0) / marks.length).toFixed(1) : '—';
  const avgAttendance = attendance.length > 0 ? (attendance.reduce((s, a) => s + parseFloat(a.percentage), 0) / attendance.length).toFixed(1) : '—';

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <GraduationCap size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-dark-400 mt-0.5">
            {profile?.profile?.deptName} • Enrollment Year: {profile?.profile?.enrollmentYear}
          </p>
          <p className="text-dark-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={BookOpen} label="Enrolled Courses" value={courses.length} color="primary" />
        <StatsCard icon={ClipboardList} label="Average Marks" value={avgMarks} color="amber" />
        <StatsCard icon={BarChart3} label="Average Attendance" value={avgAttendance !== '—' ? `${avgAttendance}%` : '—'} color="emerald" />
      </div>

      {/* Recent Marks */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Marks</h3>
        <div className="space-y-3">
          {marks.slice(0, 5).map(m => (
            <div key={`${m.studentID}-${m.courseID}`} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">{m.courseCode}</span>
                <span className="text-sm text-dark-200">{m.courseName}</span>
              </div>
              <span className={`text-sm font-semibold ${m.marks >= 75 ? 'text-emerald-400' : m.marks >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {m.marks}/100
              </span>
            </div>
          ))}
          {marks.length === 0 && <p className="text-dark-500 text-sm">No marks recorded yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
