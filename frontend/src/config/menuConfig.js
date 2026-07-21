export const menuConfig = [
  {
    group: 'Dashboard',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2', roles: ['admin', 'cabang', 'auditor'] },
    ],
  },
  {
    group: 'Upload & Data',
    items: [
      { label: 'Upload Data', path: '/upload', icon: 'bi-cloud-upload', roles: ['admin'] },
      { label: 'Histori Upload', path: '/upload/history', icon: 'bi-clock-history', roles: ['admin'] },
      { label: 'Data Transaksi', path: '/transaksi', icon: 'bi-table', roles: ['admin', 'cabang', 'auditor'] },
    ],
  },
  {
    group: 'Analitik',
    items: [
      { label: 'Cabang', path: '/analitik/cabang', icon: 'bi-building', roles: ['admin', 'auditor'] },
      { label: 'Produk', path: '/analitik/produk', icon: 'bi-box-seam', roles: ['admin', 'cabang', 'auditor'] },
      { label: 'Channel', path: '/analitik/channel', icon: 'bi-hdd-network', roles: ['admin', 'cabang', 'auditor'] },
      { label: 'Amount', path: '/analitik/amount', icon: 'bi-cash-stack', roles: ['admin', 'cabang', 'auditor'] },
      { label: 'Fee', path: '/analitik/fee', icon: 'bi-coin', roles: ['admin', 'cabang', 'auditor'] },
      { label: 'Error', path: '/analitik/error', icon: 'bi-exclamation-triangle', roles: ['admin', 'auditor'] },
      { label: 'Response Code', path: '/analitik/response-code', icon: 'bi-code-square', roles: ['admin', 'auditor'] },
      { label: 'Issuer', path: '/analitik/issuer', icon: 'bi-bank', roles: ['admin', 'auditor'] },
      { label: 'Acquirer', path: '/analitik/acquirer', icon: 'bi-bank2', roles: ['admin', 'auditor'] },
      { label: 'Grafik Transaksi', path: '/analitik/grafik', icon: 'bi-graph-up-arrow', roles: ['admin', 'cabang', 'auditor'] },
    ],
  },
  {
    group: 'Laporan',
    items: [
      { label: 'Laporan', path: '/laporan', icon: 'bi-file-earmark-bar-graph', roles: ['admin', 'cabang', 'auditor'] },
    ],
  },
  {
    group: 'Master Data',
    items: [
      { label: 'Cabang', path: '/master/cabang', icon: 'bi-building-gear', roles: ['admin'] },
      { label: 'Produk', path: '/master/produk', icon: 'bi-box2-heart', roles: ['admin'] },
      { label: 'Channel', path: '/master/channel', icon: 'bi-diagram-3', roles: ['admin'] },
      { label: 'Response Code', path: '/master/response-code', icon: 'bi-list-check', roles: ['admin'] },
      { label: 'Error Code', path: '/master/error-code', icon: 'bi-bug', roles: ['admin'] },
    ],
  },
  {
    group: 'Administrasi',
    items: [
      { label: 'Manajemen User', path: '/admin/users', icon: 'bi-people', roles: ['admin'] },
      { label: 'Role Management', path: '/admin/roles', icon: 'bi-shield-lock', roles: ['admin'] },
    ],
  },
  {
    group: 'Akun',
    items: [
      { label: 'Profil', path: '/profil', icon: 'bi-person-circle', roles: ['admin', 'cabang', 'auditor'] },
      { label: 'Pengaturan', path: '/pengaturan', icon: 'bi-gear', roles: ['admin', 'cabang', 'auditor'] },
    ],
  },
];