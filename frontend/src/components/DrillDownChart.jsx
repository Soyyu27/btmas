import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../services/api';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import { namaBulan } from '../utils/formatters';

const DrillDownChart = ({ title, trendBulanan, metricKey, getValue, color, formatter, filters }) => {
  const [selectedMonth, setSelectedMonth] = useState(null); // { tahun, bulan }
  const [trendHarian, setTrendHarian] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const extractVal = (d) => (getValue ? getValue(d) : parseFloat(d[metricKey]) || 0);

  const handleMonthClick = async (params) => {
    const clicked = trendBulanan[params.dataIndex];
    if (!clicked) return;
    setSelectedMonth(clicked);
    setLoadingDaily(true);
    try {
      const res = await api.get('/dashboard/trend-harian', {
        params: { ...filters, tahun: clicked.tahun, bulan: clicked.bulan },
      });
      setTrendHarian(res.data);
    } finally {
      setLoadingDaily(false);
    }
  };

  const backToMonthly = () => {
    setSelectedMonth(null);
    setTrendHarian([]);
  };

  const totalSelectedMonth = selectedMonth
    ? (getValue
        ? (trendHarian.length > 0 ? trendHarian.reduce((sum, d) => sum + extractVal(d), 0) / (metricKey === 'success_rate' || metricKey.startsWith('rata_') ? trendHarian.length : 1) : 0)
        : trendHarian.reduce((sum, d) => sum + extractVal(d), 0))
    : null;

  const option = selectedMonth
    ? {
        tooltip: {
          trigger: 'axis',
          formatter: (p) => `${p[0].axisValue}<br/>${formatter(p[0].value)}`,
        },
        grid: { left: 60, right: 20, top: 20, bottom: 30 },
        xAxis: { type: 'category', data: trendHarian.map((d) => `Tgl ${new Date(d.tgl_full).getDate()}`) },
        yAxis: { type: 'value' },
        series: [{
          type: 'line', smooth: true,
          data: trendHarian.map((d) => extractVal(d)),
          itemStyle: { color },
          areaStyle: { color: `${color}22` },
        }],
      }
    : {
        tooltip: {
          trigger: 'axis',
          formatter: (p) => `${p[0].axisValue}<br/>${formatter(p[0].value)}`,
        },
        grid: { left: 60, right: 20, top: 20, bottom: 30 },
        xAxis: { type: 'category', data: trendBulanan.map((d) => `${namaBulan[d.bulan]} ${d.tahun}`) },
        yAxis: { type: 'value' },
        series: [{
          type: 'line', smooth: true,
          data: trendBulanan.map((d) => extractVal(d)),
          itemStyle: { color },
          areaStyle: { color: `${color}18` },
        }],
      };

  return (
    <ChartCard
      title={selectedMonth ? `${title} — ${namaBulan[selectedMonth.bulan]} ${selectedMonth.tahun}` : `${title} per Bulan`}
      subtitle={selectedMonth ? 'Rincian harian' : 'Klik salah satu titik untuk lihat rincian harian'}
      action={selectedMonth && (
        <button className="btn btn-sm btn-outline-secondary" onClick={backToMonthly}>Kembali</button>
      )}
    >
      {selectedMonth && (
        <div
          className="mx-2 mb-2 px-3 py-2"
          style={{ backgroundColor: '#F4F5F8', borderRadius: '4px', borderLeft: `3px solid ${color}` }}
        >
          <span style={{ fontSize: '11.5px', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total {title} — {namaBulan[selectedMonth.bulan]} {selectedMonth.tahun}
          </span>
          <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 700, color: '#1D2433' }}>
            {loadingDaily ? '...' : formatter(totalSelectedMonth)}
          </div>
        </div>
      )}

      {(selectedMonth ? trendHarian.length === 0 && !loadingDaily : trendBulanan.length === 0) ? (
        <EmptyState />
      ) : (
        <ReactECharts
          option={option}
          notMerge={true}
          style={{ height: '300px' }}
          onEvents={!selectedMonth ? { click: handleMonthClick } : {}}
        />
      )}
    </ChartCard>
  );
};

export default DrillDownChart;