import { useState } from 'react';
import api from '../services/api';
import FilterPanel from '../components/FilterPanel';
import ChartCard from '../components/ChartCard';
import { useAuth } from '../context/AuthContext';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const Laporan = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(() => (user?.role === 'cabang' && user?.kode_cabang ? { kode_cabang: user.kode_cabang } : {}));
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      let url, filename;
      if (type === 'excel') {
        url = '/dashboard/transactions/export';
        filename = `laporan-transaksi-${Date.now()}.xlsx`;
      } else if (type === 'csv') {
        url = '/dashboard/transactions/export-csv';
        filename = `laporan-transaksi-${Date.now()}.csv`;
      } else {
        url = '/dashboard/report/summary-pdf';
        filename = `laporan-ringkasan-${Date.now()}.pdf`;
      }
      const res = await api.get(url, { params: filters, responseType: 'blob' });
      downloadBlob(res.data, filename);
    } catch {
      alert('Gagal mengunduh laporan');
    } finally {
      setDownloading(null);
    }
  };

  const reportSections = [
    {
      group: 'Data Transaksi Lengkap',
      subtitle: 'Seluruh baris transaksi sesuai filter aktif. Cocok untuk analisis lanjutan, arsip, atau audit.',
      items: [
        { type: 'excel', label: 'Unduh Excel (.xlsx)', icon: 'bi-file-earmark-excel', iconColor: '#1D6F42' },
        { type: 'csv', label: 'Unduh CSV (.csv)', icon: 'bi-filetype-csv', iconColor: '#2E86C1' },
      ],
    },
    {
      group: 'Laporan Ringkasan',
      subtitle: 'KPI, Top 5 Produk / Channel / Cabang — format siap cetak untuk keperluan formal dan presentasi.',
      items: [
        { type: 'pdf', label: 'Unduh PDF (.pdf)', icon: 'bi-file-earmark-pdf', iconColor: '#C0392B' },
      ],
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#1D2433' }}>Laporan</h5>
          <div style={{ fontSize: '13px', color: '#8A93A6' }}>
            Unduh data transaksi dan laporan ringkasan dalam format Excel, CSV, atau PDF
          </div>
        </div>
      </div>

      <FilterPanel filters={filters} onApply={setFilters} />

      <div className="row g-3">
        {reportSections.map((section) => (
          <div className="col-md-6" key={section.group}>
            <ChartCard title={section.group} subtitle={section.subtitle}>
              <div className="px-2 pb-2 d-flex flex-column gap-2" style={{ minHeight: '100px' }}>
                <div style={{ fontSize: '12.5px', color: '#8A93A6', lineHeight: 1.6, marginBottom: '8px' }}>
                  {section.subtitle}
                </div>
                {section.items.map((item) => (
                  <button
                    key={item.type}
                    className="btn btn-sm d-flex align-items-center gap-2 w-100"
                    style={{
                      backgroundColor: downloading === item.type ? '#E2E5EB' : '#F4F5F8',
                      color: '#1D2433',
                      border: '1px solid #E2E5EB',
                      fontWeight: 600,
                      fontSize: '13px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      transition: 'all 0.15s',
                    }}
                    disabled={downloading === item.type}
                    onClick={() => handleDownload(item.type)}
                    onMouseEnter={(e) => { if (downloading !== item.type) e.target.style.backgroundColor = '#E2E5EB'; }}
                    onMouseLeave={(e) => { if (downloading !== item.type) e.target.style.backgroundColor = '#F4F5F8'; }}
                  >
                    <i className={`bi ${item.icon}`} style={{ fontSize: '18px', color: item.iconColor }} />
                    <span>{downloading === item.type ? 'Mengunduh...' : item.label}</span>
                  </button>
                ))}
              </div>
            </ChartCard>
          </div>
        ))}
      </div>

      {/* Info filtering */}
      <div
        className="mt-4 p-3 d-flex align-items-start gap-2"
        style={{ backgroundColor: '#F0F7FF', border: '1px solid #B8DAFF', borderRadius: '6px', fontSize: '12.5px', color: '#2E6DA4' }}
      >
        <i className="bi bi-info-circle" style={{ fontSize: '15px', marginTop: '1px' }} />
        <div>
          <strong>Catatan:</strong> Semua laporan yang diunduh mengikuti filter yang sedang aktif di atas.
          {user?.role === 'cabang' && (
            <span> Sebagai akun cabang, laporan Anda otomatis dibatasi untuk data <strong>Cabang {user.kode_cabang}</strong> saja.</span>
          )}
          {' '}Maksimal 50.000 baris data per unduhan Excel/CSV.
        </div>
      </div>
    </div>
  );
};

export default Laporan;