import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { GraduationCap, Users, BookOpen, Building2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, deptRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/department-wise'),
        ]);
        setStats(statsRes.data.data);
        setDeptData(deptRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
        <p className="text-dark-400 mt-1">Here's an overview of your college database</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={GraduationCap} label="Total Students" value={stats?.students || 0} color="primary" />
        <StatsCard icon={Users} label="Total Faculty" value={stats?.faculty || 0} color="emerald" />
        <StatsCard icon={BookOpen} label="Total Courses" value={stats?.courses || 0} color="amber" />
        <StatsCard icon={Building2} label="Departments" value={stats?.departments || 0} color="cyan" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" />
            Students per Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="deptName" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
              />
              <Bar dataKey="studentCount" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-amber-400" />
            Courses per Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deptData}
                dataKey="courseCount"
                nameKey="deptName"
                cx="50%" cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={4}
              >
                {deptData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {deptData.map((dept, idx) => (
              <div key={dept.deptName} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-dark-300">{dept.deptName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
