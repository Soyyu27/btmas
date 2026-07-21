import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import FilterPanel from '../components/FilterPanel';
import DrillDownChart from '../components/DrillDownChart';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Grafik = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(() => (user?.role === 'cabang' && user?.kode_cabang ? { kode_cabang: user.kode_cabang } : {}));
  const [trendBulanan, setTrendBulanan] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/trend-bulanan', { params: filters });
      setTrendBulanan(res.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  // Konfigurasi 10 grafik
  const charts = [
    {
      title: 'Jumlah Transaksi',
      metricKey: 'jumlah_transaksi',
      color: '#12203A',
      formatter: (v) => formatNumber(v),
    },
    {
      title: 'Total Nominal',
      metricKey: 'total_nominal',
      color: '#C9A46A',
      formatter: (v) => formatRupiah(v),
    },
    {
      title: 'Total Fee',
      metricKey: 'total_fee',
      color: '#4A6FA5',
      formatter: (v) => formatRupiah(v),
    },
    {
      title: 'Transaksi Sukses',
      metricKey: 'total_success',
      color: '#1F8A5C',
      formatter: (v) => formatNumber(v),
    },
    {
      title: 'Transaksi Gagal',
      metricKey: 'total_gagal',
      color: '#C0392B',
      formatter: (v) => formatNumber(v),
    },
    {
      title: 'Success Rate',
      metricKey: 'success_rate',
      color: '#2E86C1',
      formatter: (v) => `${parseFloat(v || 0).toFixed(2)}%`,
      getValue: (d) => {
        const total = (parseInt(d.total_success) || 0) + (parseInt(d.total_gagal) || 0);
        return total > 0 ? ((parseInt(d.total_success) || 0) / total) * 100 : 0;
      },
    },
    {
      title: 'Rata-rata Nominal / Transaksi',
      metricKey: 'rata_nominal',
      color: '#8E44AD',
      formatter: (v) => formatRupiah(v),
      getValue: (d) => {
        const trx = parseInt(d.jumlah_transaksi) || 0;
        return trx > 0 ? (parseFloat(d.total_nominal) || 0) / trx : 0;
      },
    },
    {
      title: 'Rata-rata Fee / Transaksi',
      metricKey: 'rata_fee',
      color: '#D68910',
      formatter: (v) => formatRupiah(v),
      getValue: (d) => {
        const trx = parseInt(d.jumlah_transaksi) || 0;
        return trx > 0 ? (parseFloat(d.total_fee) || 0) / trx : 0;
      },
    },
    {
      title: 'Jumlah Rekening Aktif',
      metricKey: 'jumlah_rekening',
      color: '#16A085',
      formatter: (v) => formatNumber(v),
    },
    {
      title: 'Total Error',
      metricKey: 'total_error',
      color: '#E74C3C',
      formatter: (v) => formatNumber(v),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#1D2433' }}>Grafik Transaksi</h5>
          <div style={{ fontSize: '13px', color: '#8A93A6' }}>
            Visualisasi 10 metrik utama — klik titik pada grafik untuk lihat rincian harian
          </div>
        </div>
      </div>

      <FilterPanel filters={filters} onApply={setFilters} />

      {loading ? (
        <div className="text-center py-5 text-muted">Memuat data grafik...</div>
      ) : (
        <div className="row g-3">
          {charts.map((chart) => (
            <div className="col-md-6" key={chart.metricKey}>
              <DrillDownChart
                title={chart.title}
                trendBulanan={trendBulanan}
                metricKey={chart.metricKey}
                getValue={chart.getValue}
                color={chart.color}
                formatter={chart.formatter}
                filters={filters}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Grafik;