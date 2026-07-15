import { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../services/api';
import FilterPanel from '../../components/FilterPanel';
import ChartCard from '../../components/ChartCard';
import EmptyState from '../../components/EmptyState';

const AmountAnalitik = () => {
  const [filters, setFilters] = useState({});
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [distRes, trendRes] = await Promise.all([
        api.get('/dashboard/amount-distribution', { params: filters }),
        api.get('/dashboard/trend-bulanan', { params: filters }),
      ]);
      setDistribution(distRes.data);
      setTrend(trendRes.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const distOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: distribution.map((d) => d.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: distribution.map((d) => d.jumlah_transaksi), itemStyle: { color: '#12203A' }, barMaxWidth: 40 }],
  };

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: trend.map((d) => `${d.bulan}/${d.tahun}`) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: trend.map((d) => d.total_nominal), itemStyle: { color: '#C9A46A' }, areaStyle: { color: 'rgba(201,164,106,0.12)' } }],
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Analitik Amount</h5>
      <FilterPanel filters={filters} onApply={setFilters} />
      <div className="row g-3">
        <div className="col-md-6">
          <ChartCard title="Distribusi Nominal Transaksi" subtitle="Sebaran transaksi berdasarkan rentang nominal">
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : distribution.length === 0 ? <EmptyState /> : (
              <ReactECharts option={distOption} style={{ height: '340px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
        <div className="col-md-6">
          <ChartCard title="Trend Total Nominal Bulanan">
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : trend.length === 0 ? <EmptyState /> : (
              <ReactECharts option={trendOption} style={{ height: '340px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default AmountAnalitik;