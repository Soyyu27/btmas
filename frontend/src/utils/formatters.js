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