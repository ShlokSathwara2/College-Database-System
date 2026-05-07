import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen } from 'lucide-react';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        const studentID = profileRes.data.data.profile?.studentID;
        if (studentID) {
          const res = await api.get(`/enrollment/${studentID}`);
          setCourses(res.data.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <p className="text-dark-400 mt-1">Courses you are currently enrolled in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={`${c.studentID}-${c.courseID}`} className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-500/10 group-hover:scale-110 transition-transform">
                <BookOpen size={24} className="text-primary-400" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-xs text-primary-400">{c.courseCode}</span>
                <h3 className="font-semibold text-white mt-1">{c.courseName}</h3>
                <p className="text-sm text-dark-400 mt-2">{c.deptName}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700/30">
                  <span className="text-xs text-dark-500">{c.credits} Credits</span>
                  <span className="text-xs text-dark-400">{c.facultyName || 'TBA'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <div className="col-span-3 glass-card p-12 text-center"><p className="text-dark-500">Not enrolled in any courses.</p></div>}
      </div>
    </div>
  );
};

export default StudentCourses;
