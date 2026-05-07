import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ courseName: '', courseCode: '', credits: 3, deptID: '', facultyID: '' });

  const fetchCourses = async (page = 1, searchTerm = '') => {
    try {
      const res = await api.get(`/courses?page=${page}&limit=10&search=${searchTerm}`);
      setCourses(res.data.data); setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCourses();
    api.get('/departments').then(r => setDepartments(r.data.data)).catch(console.error);
    api.get('/faculty').then(r => setFacultyList(r.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/courses/${editing}`, form);
      else await api.post('/courses', form);
      setModalOpen(false); setEditing(null);
      setForm({ courseName: '', courseCode: '', credits: 3, deptID: '', facultyID: '' });
      fetchCourses(pagination.page, search);
    } catch (err) { alert(err.response?.data?.message || 'Error saving course'); }
  };

  const handleEdit = (c) => {
    setEditing(c.courseID);
    setForm({ courseName: c.courseName, courseCode: c.courseCode, credits: c.credits, deptID: c.deptID, facultyID: c.facultyID || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); fetchCourses(pagination.page, search); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key: 'courseCode', label: 'Code', render: (val) => <span className="font-mono text-primary-400 font-medium">{val}</span> },
    { key: 'courseName', label: 'Course Name', render: (val) => <span className="font-medium text-white">{val}</span> },
    { key: 'credits', label: 'Credits' },
    { key: 'deptName', label: 'Department', render: (val) => <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium">{val}</span> },
    { key: 'facultyName', label: 'Faculty', render: (val) => val || <span className="text-dark-500">Unassigned</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Manage Courses</h1>
          <p className="text-dark-400 mt-1">Add, edit, or remove courses</p></div>
        <button onClick={() => { setEditing(null); setForm({ courseName: '', courseCode: '', credits: 3, deptID: '', facultyID: '' }); setModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Course</button>
      </div>

      <DataTable columns={columns} data={courses} pagination={pagination}
        onPageChange={(p) => fetchCourses(p, search)}
        onSearch={(term) => { setSearch(term); fetchCourses(1, term); }}
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors"><Pencil size={16} /></button>
            <button onClick={() => handleDelete(row.courseID)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
          </>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Course Name</label>
              <input value={form.courseName} onChange={(e) => setForm({...form, courseName: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Course Code</label>
              <input value={form.courseCode} onChange={(e) => setForm({...form, courseCode: e.target.value})} className="input-field" required /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Credits</label>
              <input type="number" value={form.credits} onChange={(e) => setForm({...form, credits: parseInt(e.target.value)})} className="input-field" min="1" max="6" /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Department</label>
              <select value={form.deptID} onChange={(e) => setForm({...form, deptID: e.target.value})} className="input-field" required>
                <option value="">Select</option>{departments.map(d => <option key={d.deptID} value={d.deptID}>{d.deptName}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Faculty</label>
              <select value={form.facultyID} onChange={(e) => setForm({...form, facultyID: e.target.value})} className="input-field">
                <option value="">Unassigned</option>{facultyList.map(f => <option key={f.facultyID} value={f.facultyID}>{f.name}</option>)}
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCourses;
