import { useState } from 'react';
import api from '../services/api';
import FilterPanel from '../components/FilterPanel';
import ChartCard from '../components/ChartCard';

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
  const [filters, setFilters] = useState({});
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

  const reportOptions = [
    { type: 'excel', title: 'Data Transaksi', subtitle: 'Format .xlsx', description: 'Seluruh baris transaksi sesuai filter aktif. Cocok untuk analisis lanjutan atau arsip.' },
    { type: 'csv', title: 'Data Transaksi', subtitle: 'Format .csv', description: 'Seluruh baris transaksi sesuai filter aktif. Lebih ringan, cocok untuk data dalam jumlah besar.' },
    { type: 'pdf', title: 'Ringkasan', subtitle: 'Format .pdf', description: 'KPI dan Top 5 Produk/Channel/Cabang, siap cetak untuk keperluan formal.' },
  ];

  return (
    <div>
      <h5 className="fw-bold mb-3">Laporan</h5>

      <FilterPanel filters={filters} onApply={setFilters} />

      <div className="row g-3">
        {reportOptions.map((opt) => (
          <div className="col-md-4" key={opt.type}>
            <ChartCard title={opt.title} subtitle={opt.subtitle}>
              <div className="px-2 pb-2 d-flex flex-column" style={{ minHeight: '110px' }}>
                <div style={{ fontSize: '12.5px', color: '#8A93A6', flexGrow: 1, lineHeight: 1.6 }}>
                  {opt.description}
                </div>
                <button
                  className="btn btn-sm mt-3"
                  style={{ backgroundColor: 'var(--navy-950)', color: '#fff' }}
                  disabled={downloading === opt.type}
                  onClick={() => handleDownload(opt.type)}
                >
                  {downloading === opt.type ? 'Mengunduh...' : 'Unduh'}
                </button>
              </div>
            </ChartCard>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Laporan;