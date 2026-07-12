import { useState, useRef } from 'react';
import api from '../services/api';
import { formatNumber } from '../utils/formatters';

const UploadData = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal preview file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setPreview(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal import file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3" style={{ color: '#1D2433' }}>Upload Data</h5>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-4 mb-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--gold)' : '#C9CDD6'}`,
            borderRadius: '6px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragOver ? '#FBF8F3' : '#FAFBFC',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D2433' }}>
            {file ? file.name : 'Tarik file ke sini, atau klik untuk pilih'}
          </div>
          <div style={{ fontSize: '12px', color: '#8A93A6', marginTop: '4px' }}>
            Format didukung: .xlsx, .xls, .csv, .txt
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={handlePreview} disabled={loading}>
              {loading ? 'Memproses...' : 'Preview Data'}
            </button>
            <button
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }}
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Import ke Database'}
            </button>
          </div>
        )}

        {error && <div className="alert alert-danger mt-3 py-2">{error}</div>}

        {result && (
          <div className="alert alert-success mt-3">
            <strong>Import berhasil.</strong> Total baris di file: {formatNumber(result.summary.total_baris_file)},
            berhasil masuk: {formatNumber(result.summary.berhasil_insert)},
            tidak valid: {formatNumber(result.summary.baris_tidak_valid)}
          </div>
        )}
      </div>

      {preview && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-3">
          <div style={{ fontSize: '13px', color: '#8A93A6', marginBottom: '12px' }}>
            Menampilkan {preview.preview_ditampilkan} dari {formatNumber(preview.total_baris)} baris
          </div>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th><th>Status</th><th>VXSTAT</th><th>VXCHNL</th><th>VXPDES</th>
                  <th>Produk</th><th>Kategori</th><th>Cabang</th><th>Tgl</th><th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row) => (
                  <tr key={row.rowNumber} className={row.status === 'invalid' ? 'table-danger' : ''}>
                    <td>{row.rowNumber}</td>
                    <td>
                      <span className={`badge ${row.status === 'valid' ? 'bg-success' : 'bg-danger'}`}>
                        {row.status}
                      </span>
                    </td>
                    {row.status === 'valid' ? (
                      <>
                        <td>{row.data.vxstat}</td>
                        <td>{row.data.vxchnl}</td>
                        <td style={{ maxWidth: '160px' }}>{row.data.vxpdes}</td>
                        <td>{row.data.produk}</td>
                        <td>{row.data.kategori}</td>
                        <td>{row.data.kode_cabang}</td>
                        <td>{row.data.tgl_full}</td>
                        <td>{formatNumber(row.data.vxamt)}</td>
                      </>
                    ) : (
                      <td colSpan={8} className="text-danger">{row.error}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadData;