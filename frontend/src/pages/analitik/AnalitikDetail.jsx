import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import api from '../../services/api';
import FilterPanel from '../../components/FilterPanel';
import ChartCard from '../../components/ChartCard';
import EmptyState from '../../components/EmptyState';
import { analitikConfig } from '../../config/analitikConfig';
import { formatRupiah, formatNumber } from '../../utils/formatters';

const NAVY = '#12203A';
const GOLD = '#C9A46A';

const AnalitikDetail = () => {
  const { dimension } = useParams();
  const config = analitikConfig[dimension];

  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/breakdown/${config.dimension}`, { params: { ...filters, limit: 15 } });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [filters, config.dimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!config) return <div>Dimensi tidak dikenali</div>;

  const totalTransaksi = data.reduce((sum, d) => sum + d.jumlah_transaksi, 0);
  const totalNominal = data.reduce((sum, d) => sum + d.total_nominal, 0);
  const totalFee = data.reduce((sum, d) => sum + d.total_fee, 0);

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map((d) => d.label).reverse(), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: data.map((d) => d.jumlah_transaksi).reverse(), itemStyle: { color: NAVY }, barMaxWidth: 18 }],
  };

  const nominalOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>${formatRupiah(p.value)}`,
    },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: data.slice(0, 8).map((d, i) => ({
          name: d.label,
          value: d.total_nominal,
          itemStyle: { color: ['#12203A', '#C9A46A', '#4A6FA5', '#8A93A6', '#7A5C3E', '#2E4A6B', '#B7791F', '#1F8A5C'][i % 8] },
        })),
      },
    ],
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Analitik {config.label}</h5>

      <FilterPanel filters={filters} onApply={setFilters} />

      <div className="row row-cols-3 g-3 mb-4">
        <div className="col">
          <div className="p-3" style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
            <div style={{ fontSize: '11.5px', color: '#8A93A6', textTransform: 'uppercase', fontWeight: 600 }}>Total Transaksi</div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700 }}>{formatNumber(totalTransaksi)}</div>
          </div>
        </div>
        <div className="col">
          <div className="p-3" style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
            <div style={{ fontSize: '11.5px', color: '#8A93A6', textTransform: 'uppercase', fontWeight: 600 }}>Total Nominal</div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: NAVY }}>{formatRupiah(totalNominal)}</div>
          </div>
        </div>
        <div className="col">
          <div className="p-3" style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
            <div style={{ fontSize: '11.5px', color: '#8A93A6', textTransform: 'uppercase', fontWeight: 600 }}>Total Fee</div>
            <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: GOLD }}>{formatRupiah(totalFee)}</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-7">
          <ChartCard title={`Jumlah Transaksi per ${config.columnLabel}`}>
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : data.length === 0 ? <EmptyState /> : (
              <ReactECharts option={barOption} style={{ height: '360px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
        <div className="col-md-5">
          <ChartCard title="Proporsi Nominal">
            {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : data.length === 0 ? <EmptyState /> : (
              <ReactECharts option={nominalOption} style={{ height: '360px' }} notMerge={true} />
            )}
          </ChartCard>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th className="ps-3">{config.columnLabel}</th>
                <th className="text-end">Jumlah Transaksi</th>
                <th className="text-end">Total Nominal</th>
                <th className="text-end">Total Fee</th>
                <th className="text-end">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5}><EmptyState /></td></tr>
              ) : (
                data.map((d) => (
                  <tr key={d.label}>
                    <td className="ps-3 fw-semibold">{d.label}</td>
                    <td className="text-end tabular-nums">{formatNumber(d.jumlah_transaksi)}</td>
                    <td className="text-end tabular-nums">{formatRupiah(d.total_nominal)}</td>
                    <td className="text-end tabular-nums">{formatRupiah(d.total_fee)}</td>
                    <td className="text-end tabular-nums">{d.success_rate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalitikDetail;