export const formatRupiah = (value) => {
  if (value === null || value === undefined) return 'Rp 0';
  return 'Rp ' + Number(value).toLocaleString('id-ID');
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('id-ID');
};

export const namaBulan = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Mapping kode channel ke nama channel
export const channelLabel = {
  '6010': 'Teller',
  '6011': 'ATM',
  '6012': 'EDC',
  '6014': 'CMS',
  '6017': 'MBanking',
};

// Format channel: tampilkan "Teller (6010)" jika dikenal, atau kode asli jika tidak
export const formatChannel = (code) => {
  if (!code) return '-';
  const name = channelLabel[code];
  return name ? `${name} (${code})` : code;
};