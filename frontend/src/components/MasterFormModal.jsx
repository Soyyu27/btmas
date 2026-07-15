import { useState, useEffect } from 'react';

const MasterFormModal = ({ config, initialData, onSubmit, onClose }) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      const empty = {};
      config.fields.forEach((f) => { empty[f.name] = ''; });
      setForm(empty);
    }
  }, [initialData, config]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(11,21,38,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '6px', width: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid #E2E5EB' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>{isEdit ? 'Edit' : 'Tambah'} {config.label}</span>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3">
            {error && <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>{error}</div>}
            {config.fields.map((f) => (
              <div className="mb-3" key={f.name}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    className="form-select form-select-sm"
                    required={f.required}
                    disabled={isEdit && f.editable === false}
                    value={form[f.name] || ''}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                  >
                    <option value="">Pilih...</option>
                    {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required={f.required}
                    maxLength={f.maxLength}
                    disabled={isEdit && f.editable === false}
                    value={form[f.name] || ''}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 d-flex gap-2" style={{ borderTop: '1px solid #E2E5EB' }}>
            <button type="button" className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-sm flex-grow-1" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterFormModal;