import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        const studentID = profileRes.data.data.profile?.studentID;
        if (studentID) {
          const res = await api.get(`/marks/student/${studentID}`);
          setMarks(res.data.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const getGrade = (m) => m >= 90 ? 'A+' : m >= 75 ? 'A' : m >= 60 ? 'B' : m >= 40 ? 'C' : 'F';
  const getColor = (m) => m >= 90 ? 'text-emerald-400' : m >= 75 ? 'text-cyan-400' : m >= 60 ? 'text-amber-400' : 'text-red-400';

  const chartData = marks.map(m => ({ name: m.courseCode, marks: parseFloat(m.marks) }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">My Marks</h1>
        <p className="text-dark-400 mt-1">View your marks across all enrolled courses</p></div>

      {/* Chart */}
      {marks.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="marks" radius={[6, 6, 0, 0]} name="Marks">
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-dark-700/50">
            <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Course</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Code</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Credits</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Marks</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Grade</th>
          </tr></thead>
          <tbody className="divide-y divide-dark-700/30">
            {marks.map(m => (
              <tr key={m.courseID} className="hover:bg-dark-700/20 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-white">{m.courseName}</td>
                <td className="px-6 py-4 text-sm font-mono text-primary-400">{m.courseCode}</td>
                <td className="px-6 py-4 text-sm text-dark-300">{m.credits}</td>
                <td className="px-6 py-4 text-sm font-semibold text-white">{m.marks}/100</td>
                <td className="px-6 py-4"><span className={`text-sm font-bold ${getColor(m.marks)}`}>{getGrade(m.marks)}</span></td>
              </tr>
            ))}
            {marks.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-dark-500">No marks recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentMarks;
