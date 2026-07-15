import { useState, useRef } from 'react';
import api from '../services/api';

const LARGE_FILE_THRESHOLD = 20 * 1024 * 1024; // 20MB

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { processing: bool, summary?, status? }
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const handleFile = (selectedFile) => {
    setResult(null);
    setError('');
    const allowedExt = ['.xlsx', '.xls', '.csv', '.txt'];
    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExt.includes(ext)) {
      setError('Format file tidak didukung. Gunakan .xlsx, .xls, .csv, atau .txt');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const isExcel = file && ['.xlsx', '.xls'].includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase());
  const isExcelLarge = isExcel && file.size > LARGE_FILE_THRESHOLD;

  const pollStatus = (logId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/upload/status/${logId}`);
        if (res.data.status !== 'processing') {
          clearInterval(pollIntervalRef.current);
          setResult({
            processing: false,
            status: res.data.status,
            summary: {
              total_baris_file: res.data.total_baris_file,
              berhasil_insert: res.data.berhasil_insert,
              baris_tidak_valid: res.data.baris_tidak_valid,
              kemungkinan_duplikat_diskip: res.data.duplikat_diskip,
            },
            errorMessage: res.data.error_message,
          });
        }
      } catch {
        clearInterval(pollIntervalRef.current);
      }
    }, 3000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ processing: true, logId: res.data.logId });
      setFile(null);
      pollStatus(res.data.logId);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload gagal, coba lagi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Upload Data</h5>

      <div className="row g-3">
        <div className="col-md-7">
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--gold)' : '#C6CBD6'}`,
                borderRadius: '6px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragActive ? 'rgba(201,164,106,0.05)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D2433' }}>
                Tarik file ke sini atau klik untuk pilih file
              </div>
              <div style={{ fontSize: '12.5px', color: '#8A93A6', marginTop: '4px' }}>
                Format didukung: .xlsx, .xls, .csv, .txt
              </div>
            </div>

            {file && (
              <div className="d-flex align-items-center justify-content-between mt-3 p-2" style={{ backgroundColor: '#F4F5F8', borderRadius: '4px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#8A93A6' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setFile(null)}>Batal</button>
              </div>
            )}

            {isExcelLarge && (
              <div className="alert alert-warning mt-3 py-2" style={{ fontSize: '12.5px' }}>
                File Excel besar ({(file.size / 1024 / 1024).toFixed(1)}MB) — proses akan lebih lambat dibanding CSV/TXT untuk volume data besar (jutaan baris). Jika memungkinkan, ekspor ke format CSV untuk hasil lebih cepat.
              </div>
            )}

            {error && <div className="alert alert-danger mt-3 py-2" style={{ fontSize: '13px' }}>{error}</div>}

            <button
              className="btn w-100 mt-3"
              style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }}
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? 'Mengirim...' : 'Import Data'}
            </button>
          </div>
        </div>

        <div className="col-md-5">
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="p-4 h-100">
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Ketentuan File</div>
            <ul style={{ fontSize: '12.5px', color: '#5C6478', paddingLeft: '18px', lineHeight: 1.8 }}>
              <li>Kolom wajib: <code>VXLCDT</code>, <code>VXCHNL</code>, <code>VXPDES</code></li>
              <li>Format tanggal <code>VXLCDT</code>: YYMMDD (6 digit)</li>
              <li>Header kolom bebas huruf besar/kecil</li>
              <li>Untuk data dalam jumlah besar (ratusan ribu - jutaan baris), gunakan format CSV/TXT — jauh lebih cepat diproses dibanding Excel</li>
              <li>Baris duplikat (berdasarkan hash seluruh kolom) otomatis dilewati</li>
              <li>Upload berjalan di background — kamu bisa tinggalkan halaman ini, cek hasilnya di <strong>Histori Upload</strong></li>
            </ul>

            {result?.processing && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E2E5EB' }}>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: '14px', height: '14px', color: '#2563EB' }}
                    role="status"
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
                    Sedang diproses di background...
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8A93A6', marginTop: '6px' }}>
                  Untuk file besar ini bisa memakan waktu beberapa menit. Progres akan ter-update otomatis di sini, atau pantau di halaman Histori Upload.
                </div>
              </div>
            )}

            {result && !result.processing && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E2E5EB' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D2433' }}>
                    Hasil Import Terakhir
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                    backgroundColor: result.status === 'success' ? '#E6F4EC' : result.status === 'partial' ? '#FDF3E3' : '#FBEAE9',
                    color: result.status === 'success' ? '#1F8A5C' : result.status === 'partial' ? '#B7791F' : '#C0392B',
                  }}>
                    {result.status === 'success' ? 'Berhasil' : result.status === 'partial' ? 'Sebagian' : 'Gagal'}
                  </span>
                </div>

                {result.status === 'failed' ? (
                  <div style={{ fontSize: '12.5px', color: '#C0392B' }}>
                    {result.errorMessage || 'Terjadi kesalahan saat memproses file'}
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12.5px', padding: '4px 0' }}>
                      <span className="text-muted">Total baris file</span>
                      <span className="fw-semibold tabular-nums">{result.summary.total_baris_file?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12.5px', padding: '4px 0' }}>
                      <span className="text-muted">Berhasil masuk</span>
                      <span className="fw-semibold tabular-nums" style={{ color: '#1F8A5C' }}>{result.summary.berhasil_insert?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12.5px', padding: '4px 0' }}>
                      <span className="text-muted">Baris tidak valid</span>
                      <span className="fw-semibold tabular-nums" style={{ color: '#C0392B' }}>{result.summary.baris_tidak_valid?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12.5px', padding: '4px 0' }}>
                      <span className="text-muted">Duplikat dilewati</span>
                      <span className="fw-semibold tabular-nums">{result.summary.kemungkinan_duplikat_diskip?.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;