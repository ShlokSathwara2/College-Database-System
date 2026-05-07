import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deptName, setDeptName] = useState('');

  const fetchDepartments = async () => {
    try { const res = await api.get('/departments'); setDepartments(res.data.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/departments/${editing}`, { deptName });
      else await api.post('/departments', { deptName });
      setModalOpen(false); setEditing(null); setDeptName('');
      fetchDepartments();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? All associated students, faculty, and courses will also be deleted.')) return;
    try { await api.delete(`/departments/${id}`); fetchDepartments(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Manage Departments</h1>
          <p className="text-dark-400 mt-1">Manage college departments</p></div>
        <button onClick={() => { setEditing(null); setDeptName(''); setModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Department</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.deptID} className="glass-card p-6 hover:border-dark-600 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-500/10 group-hover:scale-110 transition-transform">
                  <Building2 size={24} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{dept.deptName}</h3>
                  <p className="text-sm text-dark-400 mt-1">{dept.studentCount} students</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(dept.deptID); setDeptName(dept.deptName); setModalOpen(true); }}
                  className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(dept.deptID)}
                  className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Department' : 'Add Department'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-dark-300 mb-1">Department Name</label>
            <input value={deptName} onChange={(e) => setDeptName(e.target.value)} className="input-field" required placeholder="e.g., Computer Science" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDepartments;
