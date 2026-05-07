import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', deptID: '', subject: '', phone: '' });

  const fetchFaculty = async (page = 1, searchTerm = '') => {
    try {
      const res = await api.get(`/faculty?page=${page}&limit=10&search=${searchTerm}`);
      setFaculty(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try { const res = await api.get('/departments'); setDepartments(res.data.data); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchFaculty(); fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/faculty/${editing}`, form); }
      else { await api.post('/faculty', { ...form, password: form.password || 'password123' }); }
      setModalOpen(false); setEditing(null);
      setForm({ name: '', email: '', password: '', deptID: '', subject: '', phone: '' });
      fetchFaculty(pagination.page, search);
    } catch (err) { alert(err.response?.data?.message || 'Error saving faculty'); }
  };

  const handleEdit = (f) => {
    setEditing(f.facultyID);
    setForm({ name: f.name, email: f.email, password: '', deptID: f.deptID, subject: f.subject, phone: f.phone || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try { await api.delete(`/faculty/${id}`); fetchFaculty(pagination.page, search); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting'); }
  };

  const columns = [
    { key: 'facultyID', label: 'ID' },
    { key: 'name', label: 'Name', render: (val) => <span className="font-medium text-white">{val}</span> },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject', render: (val) => <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">{val}</span> },
    { key: 'deptName', label: 'Department' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Faculty</h1>
          <p className="text-dark-400 mt-1">Add, edit, or remove faculty members</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', deptID: '', subject: '', phone: '' }); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      <DataTable columns={columns} data={faculty} pagination={pagination}
        onPageChange={(p) => fetchFaculty(p, search)}
        onSearch={(term) => { setSearch(term); fetchFaculty(1, term); }}
        searchPlaceholder="Search by name, subject, or department..."
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors"><Pencil size={16} /></button>
            <button onClick={() => handleDelete(row.facultyID)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
          </>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Faculty' : 'Add Faculty'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field" required /></div>
          </div>
          {!editing && <div><label className="block text-sm font-medium text-dark-300 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" placeholder="Default: password123" /></div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Department</label>
              <select value={form.deptID} onChange={(e) => setForm({...form, deptID: e.target.value})} className="input-field" required>
                <option value="">Select</option>{departments.map(d => <option key={d.deptID} value={d.deptID}>{d.deptName}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="input-field" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-dark-300 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFaculty;
