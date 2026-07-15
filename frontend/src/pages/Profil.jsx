import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const roleLabel = { admin: 'Administrator', cabang: 'Cabang', auditor: 'Auditor' };

const Profil = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: '', current_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/me').then((res) => setForm((prev) => ({ ...prev, full_name: res.data.full_name || '' })));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await api.put('/users/me', form);
      setMessage('Profil berhasil diperbarui');
      setForm({ full_name: res.data.user.full_name, current_password: '', new_password: '' });
      login(res.data.user, localStorage.getItem('token')); // refresh context
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Profil</h5>

      <div className="row g-3">
        <div className="col-md-5">
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-4">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--navy-950)', color: 'var(--gold)', fontSize: '24px', fontWeight: 700 }}
            >
              {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: '12.5px', color: '#8A93A6' }}>@{user?.username}</div>
              <span style={{
                display: 'inline-block', marginTop: '8px', fontSize: '11px', fontWeight: 600,
                padding: '3px 10px', borderRadius: '4px', backgroundColor: '#F4F5F8', color: 'var(--navy-950)',
              }}>
                {roleLabel[user?.role]} {user?.kode_cabang && `— Cabang ${user.kode_cabang}`}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-4">
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Edit Profil</div>
            {message && <div className="alert alert-success py-2" style={{ fontSize: '13px' }}>{message}</div>}
            {error && <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Nama Lengkap</label>
                <input type="text" className="form-control form-control-sm"
                  value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <hr />
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Ganti Password</div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px' }}>Password Saat Ini</label>
                <input type="password" className="form-control form-control-sm"
                  value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px' }}>Password Baru</label>
                <input type="password" className="form-control form-control-sm"
                  value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;