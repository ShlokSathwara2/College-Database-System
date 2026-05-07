import { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        const studentID = profileRes.data.data.profile?.studentID;
        if (studentID) {
          const res = await api.get(`/attendance/student/${studentID}`);
          setAttendance(res.data.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const getColor = (pct) => pct >= 90 ? '#10b981' : pct >= 75 ? '#22d3ee' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const getLabel = (pct) => pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : 'Low';

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">My Attendance</h1>
        <p className="text-dark-400 mt-1">Track your attendance across all courses</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map(a => {
          const pieData = [
            { name: 'Present', value: parseFloat(a.percentage) },
            { name: 'Absent', value: 100 - parseFloat(a.percentage) },
          ];
          return (
            <div key={a.courseID} className="glass-card p-6 hover:border-dark-600 transition-all duration-300">
              <div className="text-center">
                <span className="font-mono text-xs text-primary-400">{a.courseCode}</span>
                <h3 className="font-semibold text-white mt-1">{a.courseName}</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} startAngle={90} endAngle={-270}>
                    <Cell fill={getColor(a.percentage)} />
                    <Cell fill="#1e293b" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-4">
                <p className="text-2xl font-bold text-white">{a.percentage}%</p>
                <p className="text-xs mt-1" style={{ color: getColor(a.percentage) }}>{getLabel(a.percentage)}</p>
              </div>
            </div>
          );
        })}
        {attendance.length === 0 && <div className="col-span-3 glass-card p-12 text-center"><p className="text-dark-500">No attendance records yet.</p></div>}
      </div>
    </div>
  );
};

export default StudentAttendance;
