import { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import FilterPanel from '../components/FilterPanel';
import { formatRupiah, formatNumber, namaBulan } from '../utils/formatters';

const GOLD = '#C9A46A';
const NAVY = '#12203A';
const PALETTE = ['#12203A', '#C9A46A', '#4A6FA5', '#8A93A6', '#7A5C3E', '#2E4A6B'];

const Dashboard = () => {
  const [filters, setFilters] = useState({});
  const [kpi, setKpi] = useState(null);
  const [trendBulanan, setTrendBulanan] = useState([]);
  const [trendHarian, setTrendHarian] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null); // { tahun, bulan }
  const [statusDist, setStatusDist] = useState([]);
  const [topProduk, setTopProduk] = useState([]);
  const [topChannel, setTopChannel] = useState([]);
  const [topCabang, setTopCabang] = useState([]);
  const [kategoriStatus, setKategoriStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const [kpiRes, bulananRes, statusRes, produkRes, channelRes, cabangRes, kategoriRes] = await Promise.all([
        api.get('/dashboard/kpi', { params: activeFilters }),
        api.get('/dashboard/trend-bulanan', { params: activeFilters }),
        api.get('/dashboard/status', { params: activeFilters }),
        api.get('/dashboard/top-produk', { params: { ...activeFilters, limit: 8 } }),
        api.get('/dashboard/top-channel', { params: { ...activeFilters, limit: 8 } }),
        api.get('/dashboard/top-cabang', { params: { ...activeFilters, limit: 8 } }),
        api.get('/dashboard/kategori-vs-status', { params: activeFilters }),
      ]);
      setKpi(kpiRes.data);
      setTrendBulanan(bulananRes.data);
      setStatusDist(statusRes.data);
      setTopProduk(produkRes.data);
      setTopChannel(channelRes.data);
      setTopCabang(cabangRes.data);
      setKategoriStatus(kategoriRes.data);
      setSelectedMonth(null);
      setTrendHarian([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  // Drill-down: klik titik bulan -> fetch data harian bulan itu
  const handleMonthClick = async (params) => {
    const clicked = trendBulanan[params.dataIndex];
    if (!clicked) return;
    setSelectedMonth({ tahun: clicked.tahun, bulan: clicked.bulan });
    const res = await api.get('/dashboard/trend-harian', {
      params: { ...filters, tahun: clicked.tahun, bulan: clicked.bulan },
    });
    setTrendHarian(res.data);
  };

  const backToMonthly = () => {
    setSelectedMonth(null);
    setTrendHarian([]);
  };

  // ===== Chart options =====

  const dataAktif = selectedMonth ? trendHarian : trendBulanan;
  const isEmpty = dataAktif.length === 0;
  const isSingle = dataAktif.length === 1;

  const trendOption = selectedMonth
    ? {
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: 'category',
          data: trendHarian.map((d) => `Tgl ${new Date(d.tgl_full).getDate()}`),
        },
        yAxis: { type: 'value', min: 0 },
        series: [
          {
            name: 'Jumlah Transaksi',
            type: isSingle ? 'bar' : 'line',
            smooth: true,
            data: trendHarian.map((d) => d.jumlah_transaksi),
            itemStyle: { color: GOLD },
            areaStyle: isSingle ? undefined : { color: 'rgba(201,164,106,0.12)' },
            barMaxWidth: 40,
            barCategoryGap: '60%',
            symbolSize: 10,
          },
        ],
      }
    : {
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: 'category',
          data: trendBulanan.map((d) => `${namaBulan[d.bulan]} ${d.tahun}`),
          boundaryGap: isSingle ? true : ['5%', '5%'],
        },
        yAxis: { type: 'value', min: 0 },
        series: [
          {
            name: 'Jumlah Transaksi',
            type: isSingle ? 'bar' : 'line',
            smooth: true,
            data: trendBulanan.map((d) => d.jumlah_transaksi),
            itemStyle: { color: NAVY },
            areaStyle: isSingle ? undefined : { color: 'rgba(18,32,58,0.08)' },
            barMaxWidth: 40,
            barCategoryGap: '60%',
            symbolSize: 10,
          },
        ],
      };

  const statusOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%' },
        data: statusDist.map((d, i) => ({
          name: d.vxstat === 'P' ? 'Sukses' : d.vxstat === 'F' ? 'Gagal' : d.vxstat,
          value: d.jumlah,
          itemStyle: { color: PALETTE[i % PALETTE.length] },
        })),
      },
    ],
  };

  const topProdukOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: topProduk.map((d) => d.produk).reverse(), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: topProduk.map((d) => d.jumlah_transaksi).reverse(), itemStyle: { color: NAVY }, barMaxWidth: 18 }],
  };

  const topChannelOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: topChannel.map((d) => d.vxchnl).reverse(), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: topChannel.map((d) => d.jumlah_transaksi).reverse(), itemStyle: { color: GOLD }, barMaxWidth: 18 }],
  };

  const topCabangOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: topCabang.map((d) => d.kode_cabang).reverse(), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: topCabang.map((d) => d.jumlah_transaksi).reverse(), itemStyle: { color: '#4A6FA5' }, barMaxWidth: 18 }],
  };

  // Stacked bar: kategori vs status
  const kategoriList = [...new Set(kategoriStatus.map((d) => d.kategori))];
  const statusList = [...new Set(kategoriStatus.map((d) => d.vxstat))];
  const kategoriStatusOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: kategoriList, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: 'value' },
    series: statusList.map((status, i) => ({
      name: status === 'P' ? 'Sukses' : status === 'F' ? 'Gagal' : status,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: kategoriList.map((kat) => {
        const found = kategoriStatus.find((d) => d.kategori === kat && d.vxstat === status);
        return found ? found.jumlah : 0;
      }),
    })),
  };

  if (loading && !kpi) {
    return <div className="text-center py-5 text-muted">Memuat data dashboard...</div>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-3" style={{ color: '#1D2433' }}>Dashboard</h5>

      <FilterPanel filters={filters} onApply={setFilters} />

      {/* KPI Cards */}
      <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
        <KpiCard label="Total Transaksi" value={formatNumber(kpi?.total_transaksi)} />
        <KpiCard label="Total Nominal" value={formatRupiah(kpi?.total_nominal)} accent={NAVY} />
        <KpiCard label="Total Fee" value={formatRupiah(kpi?.total_fee)} accent={GOLD} />
        <KpiCard label="Success Rate" value={`${kpi?.success_rate ?? 0}%`} accent="#4A6FA5" />
        <KpiCard label="Jumlah Cabang" value={formatNumber(kpi?.jumlah_cabang)} />
        <KpiCard label="Jumlah Channel" value={formatNumber(kpi?.jumlah_channel)} />
        <KpiCard label="Jumlah Produk" value={formatNumber(kpi?.jumlah_produk)} />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <ChartCard
            title={selectedMonth ? `Trend Harian — ${namaBulan[selectedMonth.bulan]} ${selectedMonth.tahun}` : 'Trend Transaksi Bulanan'}
            subtitle={selectedMonth ? 'Klik "Kembali" untuk lihat trend bulanan' : 'Klik salah satu titik untuk lihat rincian harian'}
            action={selectedMonth && (
              <button className="btn btn-sm btn-outline-secondary" onClick={backToMonthly}>Kembali</button>
            )}
          >
            {isEmpty ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center text-muted"
                style={{ height: '320px', fontSize: '13.5px' }}
              >
                <i className="bi bi-bar-chart-line" style={{ fontSize: '28px', opacity: 0.4 }} />
                <div className="mt-2">Belum ada data transaksi untuk periode ini</div>
              </div>
            ) : (
              <ReactECharts
                option={trendOption}
                style={{ height: '320px' }}
                onEvents={!selectedMonth ? { click: handleMonthClick } : {}}
              />
            )}
          </ChartCard>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <ChartCard title="Status Transaksi">
            <ReactECharts option={statusOption} style={{ height: '280px' }} />
          </ChartCard>
        </div>
        <div className="col-md-4">
          <ChartCard title="Top Produk">
            <ReactECharts option={topProdukOption} style={{ height: '280px' }} />
          </ChartCard>
        </div>
        <div className="col-md-4">
          <ChartCard title="Top Channel">
            <ReactECharts option={topChannelOption} style={{ height: '280px' }} />
          </ChartCard>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <ChartCard title="Top Cabang">
            <ReactECharts option={topCabangOption} style={{ height: '300px' }} />
          </ChartCard>
        </div>
        <div className="col-md-6">
          <ChartCard title="Kategori vs Status">
            <ReactECharts option={kategoriStatusOption} style={{ height: '300px' }} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;