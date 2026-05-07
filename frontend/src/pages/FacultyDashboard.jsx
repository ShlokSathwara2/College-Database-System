import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { BookOpen, Users, ClipboardList } from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?limit=50');
        // Filter courses taught by this faculty
        const myCourses = res.data.data.filter(
          c => c.facultyName === user?.name
        );
        setCourses(myCourses);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCourses();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="text-dark-400 mt-1">Faculty Dashboard — Manage your courses, marks, and attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={BookOpen} label="Courses Taught" value={courses.length} color="primary" />
        <StatsCard icon={ClipboardList} label="Manage Marks" value="→" color="amber" />
        <StatsCard icon={Users} label="Manage Attendance" value="→" color="emerald" />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">My Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.length > 0 ? courses.map(c => (
            <div key={c.courseID} className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">{c.courseCode}</span>
                <span className="font-medium text-white">{c.courseName}</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">{c.deptName} • {c.credits} credits</p>
            </div>
          )) : <p className="text-dark-500 col-span-2">No courses assigned yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
