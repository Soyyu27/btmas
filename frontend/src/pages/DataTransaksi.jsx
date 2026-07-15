import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import FilterPanel from '../components/FilterPanel';
import EmptyState from '../components/EmptyState';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { formatRupiah, formatNumber } from '../utils/formatters';

const DataTransaksi = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('tgl_full');
  const [sortOrder, setSortOrder] = useState('desc');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, total_data: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/transactions', {
        params: { ...filters, search, sort_by: sortBy, sort_order: sortOrder, page, limit: 20 },
      });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/dashboard/transactions/export', {
        params: { ...filters, search },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-transaksi-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExporting(false);
    }
  };

  const openDetail = async (id) => {
    const res = await api.get(`/dashboard/transactions/${id}`);
    setSelected(res.data);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ color: '#C6CBD6' }}> ⇅</span>;
    return <span style={{ color: 'var(--gold)' }}>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Data Transaksi</h5>
        <button className="btn btn-sm" style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }} onClick={handleExport} disabled={exporting}>
          {exporting ? 'Mengekspor...' : 'Export Excel'}
        </button>
      </div>

      <FilterPanel filters={filters} onApply={setFilters} />

      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: '320px' }}
          placeholder="Cari deskripsi, produk, channel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th className="ps-3" role="button" onClick={() => handleSort('tgl_full')}>Tanggal<SortIcon field="tgl_full" /></th>
                <th role="button" onClick={() => handleSort('vxchnl')}>Channel<SortIcon field="vxchnl" /></th>
                <th role="button" onClick={() => handleSort('produk')}>Produk<SortIcon field="produk" /></th>
                <th>Cabang</th>
                <th className="text-end" role="button" onClick={() => handleSort('vxamt')}>Nominal<SortIcon field="vxamt" /></th>
                <th className="text-end">Fee</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4 text-muted">Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="Tidak ada transaksi ditemukan" /></td></tr>
              ) : (
                data.map((tx) => (
                  <tr key={tx.id}>
                    <td className="ps-3">{tx.tgl_full}</td>
                    <td>{tx.vxchnl}</td>
                    <td>{tx.produk}</td>
                    <td>{tx.kode_cabang || '-'}</td>
                    <td className="text-end tabular-nums">{formatRupiah(tx.vxamt)}</td>
                    <td className="text-end tabular-nums">{formatRupiah(tx.vxamfe)}</td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: tx.vxstat === 'P' ? '#E6F4EC' : '#FBEAE9',
                        color: tx.vxstat === 'P' ? '#1F8A5C' : '#C0392B',
                      }}>
                        {tx.vxstat === 'P' ? 'Sukses' : 'Gagal'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-link p-0" onClick={() => openDetail(tx.id)}>Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #E2E5EB' }}>
          <span style={{ fontSize: '12.5px', color: '#8A93A6' }}>
            {formatNumber(pagination.total_data)} total data Halaman {pagination.current_page} dari {pagination.total_page || 1}
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.current_page <= 1} onClick={() => fetchData(pagination.current_page - 1)}>
              Sebelumnya
            </button>
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.current_page >= pagination.total_page} onClick={() => fetchData(pagination.current_page + 1)}>
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      <TransactionDetailModal data={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default DataTransaksi;