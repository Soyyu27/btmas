export const masterDataFormConfig = {
  cabang: {
    label: 'Master Cabang',
    apiPath: 'cabang',
    primaryKey: 'kode_cabang',
    fields: [
      { name: 'kode_cabang', label: 'Kode Cabang', type: 'text', required: true, editable: false, maxLength: 3 },
      { name: 'nama_cabang', label: 'Nama Cabang', type: 'text', required: true },
      { name: 'alamat', label: 'Alamat', type: 'text' },
    ],
  },
  channel: {
    label: 'Master Channel',
    apiPath: 'channel',
    primaryKey: 'kode_channel',
    fields: [
      { name: 'kode_channel', label: 'Kode Channel', type: 'text', required: true, editable: false },
      { name: 'nama_channel', label: 'Nama Channel', type: 'text', required: true },
      { name: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  produk: {
    label: 'Master Produk',
    apiPath: 'produk',
    primaryKey: 'id',
    fields: [
      { name: 'nama_produk', label: 'Nama Produk', type: 'text', required: true },
      {
        name: 'kategori', label: 'Kategori', type: 'select', required: true,
        options: ['TELCO', 'LISTRIK', 'AIR', 'EWALLET', 'PAJAK_RETRIBUSI', 'ASURANSI_JAMINAN', 'TRAVEL', 'TAGIHAN_LAIN', 'TRANSFER', 'CASH'],
      },
      { name: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  'response-code': {
    label: 'Master Response Code',
    apiPath: 'response-code',
    primaryKey: 'kode',
    fields: [
      { name: 'kode', label: 'Kode', type: 'text', required: true, editable: false },
      { name: 'keterangan', label: 'Keterangan', type: 'text', required: true },
    ],
  },
  'error-code': {
    label: 'Master Error Code',
    apiPath: 'error-code',
    primaryKey: 'kode',
    fields: [
      { name: 'kode', label: 'Kode', type: 'text', required: true, editable: false },
      { name: 'keterangan', label: 'Keterangan', type: 'text', required: true },
    ],
  },
};