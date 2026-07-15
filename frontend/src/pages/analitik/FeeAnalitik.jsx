import { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../services/api';
import FilterPanel from '../../components/FilterPanel';
import ChartCard from '../../components/ChartCard';
import EmptyState from '../../components/EmptyState';

const FeeAnalitik = () => {
  const [filters, setFilters] = useState({});
  const [trend, setTrend] = useState([]);
  const [byProduk, setByProduk] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [trendRes, produkRes] = await Promise.all([
        api.get('/dashboard/trend-bulanan', { params: filters }),
        api.get('/dashboard/breakdown/produk', { params: { ...filters, limit: 10 } }),
      ]);
      setTrend(trendRes.data);
      setByProduk(produkRes.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: trend.map((d) => `${d.bulan}/${d.tahun}`) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: trend.map((d) => d.total_fee), itemStyle: { color: '#12203A' }, areaStyle: { color: 'rgba(18,32,58,0.08)' } }],
  };

  const produkOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: byProduk.map((d) => d.label).reverse(), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: byProduk.map((d) => d.total_fee).reverse(), itemStyle: { color: '#C9A46A' }, barMaxWidth: 18 }],
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Analitik Fee</h5>
      <FilterPanel filters={filters} onApply={setFilters} />
      <div className="row g-3">
        <div className="col-md-6">
          <ChartCard title="Trend Total Fee Bulanan">
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : trend.length === 0 ? <EmptyState /> : (
              <ReactECharts option={trendOption} style={{ height: '340px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
        <div className="col-md-6">
          <ChartCard title="Total Fee per Produk">
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : byProduk.length === 0 ? <EmptyState /> : (
              <ReactECharts option={produkOption} style={{ height: '340px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default FeeAnalitik;