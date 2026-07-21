import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatChannel } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const FilterPanel = ({ filters, onApply }) => {
  const { user } = useAuth();
  const [local, setLocal] = useState(filters);
  const [options, setOptions] = useState({ produk: [], kategori: [], channel: [], status: [], cabang: [] });

  useEffect(() => {
    if (user?.role === 'cabang' && user?.kode_cabang) {
      setLocal((prev) => ({ ...filters, kode_cabang: user.kode_cabang }));
    } else {
      setLocal(filters);
    }
  }, [filters, user]);

  useEffect(() => {
    api.get('/dashboard/filters').then((res) => setOptions(res.data)).catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    const nextFilters = { ...local, [field]: value };
    if (user?.role === 'cabang' && user?.kode_cabang) {
      nextFilters.kode_cabang = user.kode_cabang;
    }
    setLocal(nextFilters);
    onApply(nextFilters);
  };

  const handleReset = () => {
    const empty = user?.role === 'cabang' && user?.kode_cabang ? { kode_cabang: user.kode_cabang } : {};
    setLocal(empty);
    onApply(empty);
  };

  return (
    <div className="d-flex flex-wrap align-items-end gap-2 p-2 p-md-3 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '130px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Tanggal Awal</label>
        <input type="date" className="form-control form-control-sm" value={local.tanggal_awal || ''} onChange={(e) => handleChange('tanggal_awal', e.target.value)} />
      </div>
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '130px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Tanggal Akhir</label>
        <input type="date" className="form-control form-control-sm" value={local.tanggal_akhir || ''} onChange={(e) => handleChange('tanggal_akhir', e.target.value)} />
      </div>
      {user?.role === 'cabang' ? (
        <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
          <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Cabang</label>
          <input type="text" className="form-control form-control-sm bg-light" value={`Cabang ${user.kode_cabang}`} disabled readOnly style={{ fontWeight: 600 }} />
        </div>
      ) : (
        <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
          <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Cabang</label>
          <select className="form-select form-select-sm" value={local.kode_cabang || ''} onChange={(e) => handleChange('kode_cabang', e.target.value)}>
            <option value="">Semua</option>
            {options.cabang.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Produk</label>
        <select className="form-select form-select-sm" value={local.produk || ''} onChange={(e) => handleChange('produk', e.target.value)}>
          <option value="">Semua</option>
          {options.produk.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Kategori</label>
        <select className="form-select form-select-sm" value={local.kategori || ''} onChange={(e) => handleChange('kategori', e.target.value)}>
          <option value="">Semua</option>
          {options.kategori.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Channel</label>
        <select className="form-select form-select-sm" value={local.vxchnl || ''} onChange={(e) => handleChange('vxchnl', e.target.value)}>
          <option value="">Semua</option>
          {options.channel.map((c) => <option key={c} value={c}>{formatChannel(c)}</option>)}
        </select>
      </div>
      <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '120px' }}>
        <label className="form-label mb-1" style={{ fontSize: '12px', color: '#8A93A6' }}>Status</label>
        <select className="form-select form-select-sm" value={local.vxstat || ''} onChange={(e) => handleChange('vxstat', e.target.value)}>
          <option value="">Semua</option>
          {options.status.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <button className="btn btn-sm btn-outline-secondary ms-auto w-100 w-sm-auto mt-2 mt-sm-0" onClick={handleReset}>
        Reset Filter
      </button>
    </div>
  );
};

export default FilterPanel;