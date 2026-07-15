import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/dateFormat';

const roleLabel = { admin: 'Administrator', cabang: 'Cabang', auditor: 'Auditor' };

const emptyForm = { username: '', password: '', full_name: '', role: 'auditor', kode_cabang: '', is_active: true };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { search } });
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditItem(user);
    setForm({ ...user, password: '' });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus user "${user.username}"?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await api.put(`/users/${editItem.id}`, form);
      } else {
        await api.post('/users', form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Manajemen User</h5>
        <button className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} onClick={handleAdd}>
          + Tambah User
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: '280px' }}
          placeholder="Cari username / nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th className="ps-3">Username</th>
                <th>Nama Lengkap</th>
                <th>Role</th>
                <th>Kode Cabang</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th className="text-end pe-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Memuat...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Belum ada user" /></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-3 fw-semibold">{u.username}</td>
                    <td>{u.full_name || '-'}</td>
                    <td>{roleLabel[u.role] || u.role}</td>
                    <td>{u.kode_cabang || '-'}</td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: u.is_active ? '#E6F4EC' : '#FBEAE9',
                        color: u.is_active ? '#1F8A5C' : '#C0392B',
                      }}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ color: '#8A93A6' }}>{formatDateTime(u.created_at)}</td>
                    <td className="text-end pe-3">
                      <button className="btn btn-sm btn-link p-0 me-3" onClick={() => handleEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-link p-0 text-danger" onClick={() => handleDelete(u)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(11,21,38,0.5)', zIndex: 1050 }}
          onClick={() => setModalOpen(false)}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '6px', width: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid #E2E5EB' }}>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>{editItem ? 'Edit' : 'Tambah'} User</span>
              <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-3">
                {error && <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>{error}</div>}

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Username</label>
                  <input type="text" className="form-control form-control-sm" required disabled={!!editItem}
                    value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Password {editItem && <span style={{ fontWeight: 400, color: '#8A93A6' }}>(kosongkan jika tidak diubah)</span>}
                  </label>
                  <input type="password" className="form-control form-control-sm" required={!editItem}
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Nama Lengkap</label>
                  <input type="text" className="form-control form-control-sm"
                    value={form.full_name || ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Role</label>
                  <select className="form-select form-select-sm" value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="admin">Administrator</option>
                    <option value="cabang">Cabang</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>
                {form.role === 'cabang' && (
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Kode Cabang</label>
                    <input type="text" className="form-control form-control-sm" required maxLength={3}
                      value={form.kode_cabang || ''} onChange={(e) => setForm({ ...form, kode_cabang: e.target.value })} />
                  </div>
                )}
                {editItem && (
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="isActive"
                      checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    <label className="form-check-label" htmlFor="isActive" style={{ fontSize: '13px' }}>Akun aktif</label>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 d-flex gap-2" style={{ borderTop: '1px solid #E2E5EB' }}>
                <button type="button" className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-sm flex-grow-1" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;