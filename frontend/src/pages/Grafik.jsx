import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import FilterPanel from '../components/FilterPanel';
import DrillDownChart from '../components/DrillDownChart';
import { formatRupiah, formatNumber } from '../utils/formatters';

const Grafik = () => {
  const [filters, setFilters] = useState({});
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

  return (
    <div>
      <h5 className="fw-bold mb-3">Grafik Transaksi</h5>

      <FilterPanel filters={filters} onApply={setFilters} />

      {loading ? (
        <div className="text-center py-5 text-muted">Memuat data grafik...</div>
      ) : (
        <div className="row g-3">
          <div className="col-12">
            <DrillDownChart
              title="Jumlah Transaksi"
              trendBulanan={trendBulanan}
              metricKey="jumlah_transaksi"
              color="#12203A"
              formatter={(v) => formatNumber(v)}
              filters={filters}
            />
          </div>
          <div className="col-12">
            <DrillDownChart
              title="Total Nominal"
              trendBulanan={trendBulanan}
              metricKey="total_nominal"
              color="#C9A46A"
              formatter={(v) => formatRupiah(v)}
              filters={filters}
            />
          </div>
          <div className="col-12">
            <DrillDownChart
              title="Total Fee"
              trendBulanan={trendBulanan}
              metricKey="total_fee"
              color="#4A6FA5"
              formatter={(v) => formatRupiah(v)}
              filters={filters}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Grafik;