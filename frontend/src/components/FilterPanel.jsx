import { useState, useEffect } from 'react';
import api from '../services/api';

const FilterPanel = ({ filters, onApply }) => {
  const [local, setLocal] = useState(filters);
  const [options, setOptions] = useState({ produk: [], kategori: [], channel: [], status: [], cabang: [] });

    useEffect(() => {
    setLocal(filters);
    }, [filters]);

  useEffect(() => {
    api.get('/dashboard/filters').then((res) => setOptions(res.data)).catch(() => {});
  }, []);
  

  const handleChange = (field, value) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const empty = {};
    setLocal(empty);
    onApply(empty);
  };

  return (
    <div className="d-flex flex-wrap align-items-end gap-2 p-3 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Tanggal Awal</label>
        <input type="date" className="form-control form-control-sm" value={local.tanggal_awal || ''} onChange={(e) => handleChange('tanggal_awal', e.target.value)} />
      </div>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Tanggal Akhir</label>
        <input type="date" className="form-control form-control-sm" value={local.tanggal_akhir || ''} onChange={(e) => handleChange('tanggal_akhir', e.target.value)} />
      </div>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Produk</label>
        <select className="form-select form-select-sm" value={local.produk || ''} onChange={(e) => handleChange('produk', e.target.value)}>
          <option value="">Semua</option>
          {options.produk.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Kategori</label>
        <select className="form-select form-select-sm" value={local.kategori || ''} onChange={(e) => handleChange('kategori', e.target.value)}>
          <option value="">Semua</option>
          {options.kategori.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Channel</label>
        <select className="form-select form-select-sm" value={local.vxchnl || ''} onChange={(e) => handleChange('vxchnl', e.target.value)}>
          <option value="">Semua</option>
          {options.channel.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Status</label>
        <select className="form-select form-select-sm" value={local.vxstat || ''} onChange={(e) => handleChange('vxstat', e.target.value)}>
          <option value="">Semua</option>
          {options.status.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <button className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} onClick={() => onApply(local)}>
        Terapkan
      </button>
      <button className="btn btn-sm btn-outline-secondary" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
};

export default FilterPanel;