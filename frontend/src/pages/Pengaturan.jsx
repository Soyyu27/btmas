import { useState } from 'react';

const Pengaturan = () => {
  const [itemsPerPage, setItemsPerPage] = useState(localStorage.getItem('pref_items_per_page') || '20');
  const [defaultDateRange, setDefaultDateRange] = useState(localStorage.getItem('pref_default_range') || '30');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('pref_items_per_page', itemsPerPage);
    localStorage.setItem('pref_default_range', defaultDateRange);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Pengaturan</h5>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px', maxWidth: '480px' }} className="p-4">
        {saved && <div className="alert alert-success py-2" style={{ fontSize: '13px' }}>Pengaturan disimpan</div>}

        <div className="mb-3">
          <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Jumlah Baris per Halaman (Tabel)</label>
          <select className="form-select form-select-sm" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Rentang Tanggal Default</label>
          <select className="form-select form-select-sm" value={defaultDateRange} onChange={(e) => setDefaultDateRange(e.target.value)}>
            <option value="7">7 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
            <option value="90">90 hari terakhir</option>
            <option value="0">Semua data</option>
          </select>
        </div>

        <button className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} onClick={handleSave}>
          Simpan Pengaturan
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#8A93A6', marginTop: '10px', maxWidth: '480px' }}>
        Pengaturan ini tersimpan di perangkat kamu sendiri (browser), tidak memengaruhi tampilan pengguna lain.
      </div>
    </div>
  );
};

export default Pengaturan;