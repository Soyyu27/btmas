import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/dateFormat';
import { formatNumber } from '../utils/formatters';

const UploadHistory = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, total_data: 0 });
  const [loading, setLoading] = useState(true);
  const autoRefreshRef = useRef(null);

  const fetchLogs = useCallback(async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/upload/history', { params: { page, limit: 15 } });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh tiap 4 detik selama masih ada log berstatus 'processing'
  useEffect(() => {
    const hasProcessing = logs.some((l) => l.status === 'processing');

    if (hasProcessing) {
      autoRefreshRef.current = setInterval(() => {
        fetchLogs(pagination.current_page, true); // silent = tidak nampilin loading spinner tiap refresh
      }, 4000);
    }

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [logs, pagination.current_page, fetchLogs]);

  return (
    <div>
      <h5 className="fw-bold mb-3">Histori Upload</h5>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th className="ps-3">Waktu</th>
                <th>Nama File</th>
                <th>Diupload Oleh</th>
                <th className="text-end">Total Baris</th>
                <th className="text-end">Berhasil</th>
                <th className="text-end">Tidak Valid</th>
                <th className="text-end">Duplikat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4 text-muted">Memuat...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="Belum ada riwayat upload" /></td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="ps-3">{formatDateTime(log.created_at)}</td>
                    <td className="fw-semibold">{log.filename}</td>
                    <td>{log.uploader?.full_name || log.uploader?.username || '-'}</td>
                    <td className="text-end tabular-nums">
                      {log.status === 'processing' ? '—' : formatNumber(log.total_baris_file)}
                    </td>
                    <td className="text-end tabular-nums" style={{ color: '#1F8A5C' }}>
                      {log.status === 'processing' ? '—' : formatNumber(log.berhasil_insert)}
                    </td>
                    <td className="text-end tabular-nums" style={{ color: '#C0392B' }}>
                      {log.status === 'processing' ? '—' : formatNumber(log.baris_tidak_valid)}
                    </td>
                    <td className="text-end tabular-nums">
                      {log.status === 'processing' ? '—' : formatNumber(log.duplikat_diskip)}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <StatusBadge status={log.status} />
                        {log.status === 'processing' && (
                          <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px', color: '#2563EB' }} role="status" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_page > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #E2E5EB' }}>
            <span style={{ fontSize: '12.5px', color: '#8A93A6' }}>
              Halaman {pagination.current_page} dari {pagination.total_page}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchLogs(pagination.current_page - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.current_page >= pagination.total_page}
                onClick={() => fetchLogs(pagination.current_page + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadHistory;