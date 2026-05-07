import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Save, CheckCircle } from 'lucide-react';

const ManageMarks = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?limit=50');
        const myCourses = res.data.data.filter(c => c.facultyName === user?.name);
        setCourses(myCourses);
      } catch (err) { console.error(err); }
    };
    fetchCourses();
  }, [user]);

  const fetchMarks = async (courseID) => {
    setLoading(true);
    try {
      const res = await api.get(`/marks/course/${courseID}`);
      setMarksData(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCourseChange = (e) => {
    const courseID = e.target.value;
    setSelectedCourse(courseID);
    setSaved(false);
    if (courseID) fetchMarks(courseID);
    else setMarksData([]);
  };

  const handleMarksChange = (studentID, value) => {
    setMarksData(prev => prev.map(m =>
      m.studentID === studentID ? { ...m, marks: parseFloat(value) || 0 } : m
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const payload = marksData.map(m => ({
        studentID: m.studentID,
        courseID: parseInt(selectedCourse),
        marks: m.marks,
      }));
      await api.put('/marks', { marks: payload });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Error saving marks'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Marks</h1>
        <p className="text-dark-400 mt-1">Select a course and update student marks</p>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-dark-300 mb-1">Select Course</label>
        <select value={selectedCourse} onChange={handleCourseChange} className="input-field">
          <option value="">Choose a course...</option>
          {courses.map(c => <option key={c.courseID} value={c.courseID}>{c.courseCode} — {c.courseName}</option>)}
        </select>
      </div>

      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>}

      {!loading && selectedCourse && marksData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Student</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Marks (0-100)</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {marksData.map((m) => (
                <tr key={m.studentID} className="hover:bg-dark-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{m.studentName}</td>
                  <td className="px-6 py-4 text-sm text-dark-300">{m.email}</td>
                  <td className="px-6 py-4">
                    <input type="number" min="0" max="100" value={m.marks}
                      onChange={(e) => handleMarksChange(m.studentID, e.target.value)}
                      className="w-24 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      m.marks >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                      m.marks >= 75 ? 'bg-cyan-500/10 text-cyan-400' :
                      m.marks >= 60 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {m.marks >= 90 ? 'A+' : m.marks >= 75 ? 'A' : m.marks >= 60 ? 'B' : m.marks >= 40 ? 'C' : 'F'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <div>
              {saved && <span className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={16} /> Marks saved successfully!</span>}
            </div>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={18} /> Save Marks</button>
          </div>
        </div>
      )}

      {!loading && selectedCourse && marksData.length === 0 && (
        <div className="glass-card p-12 text-center"><p className="text-dark-500">No students enrolled in this course.</p></div>
      )}
    </div>
  );
};

export default ManageMarks;
