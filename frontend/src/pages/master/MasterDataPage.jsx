import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { masterDataFormConfig } from '../../config/masterDataFormConfig';
import MasterFormModal from '../../components/MasterFormModal';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

const MasterDataPage = () => {
  const { entity } = useParams();
  const config = masterDataFormConfig[entity];
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/master/${config.apiPath}`, { params: { search } });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => { setEditItem(null); setModalOpen(true); };
  const handleEdit = (item) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (form) => {
    if (editItem) {
      await api.put(`/master/${config.apiPath}/${editItem[config.primaryKey]}`, form);
    } else {
      await api.post(`/master/${config.apiPath}`, form);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus "${item[config.fields[1]?.name] || item[config.primaryKey]}"?`)) return;
    await api.delete(`/master/${config.apiPath}/${item[config.primaryKey]}`);
    fetchData();
  };

  if (!config) return <div>Master data tidak dikenali</div>;

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">{config.label}</h5>
        {isAdmin && (
          <button className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} onClick={handleAdd}>
            + Tambah Data
          </button>
        )}
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: '280px' }}
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {config.fields.map((f) => (
                  <th key={f.name} className="ps-3">{f.label}</th>
                ))}
                {isAdmin && <th className="text-end pe-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={config.fields.length + 1} className="text-center py-4 text-muted">Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={config.fields.length + 1}><EmptyState message="Belum ada data" /></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item[config.primaryKey]}>
                    {config.fields.map((f) => (
                      <td key={f.name} className="ps-3">{item[f.name] || '-'}</td>
                    ))}
                    {isAdmin && (
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-link p-0 me-3" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn btn-sm btn-link p-0 text-danger" onClick={() => handleDelete(item)}>Hapus</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <MasterFormModal
          config={config}
          initialData={editItem}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MasterDataPage;