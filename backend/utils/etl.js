const crypto = require('crypto');
const { getProdukKategori } = require('./produkMap');

// Parsing VXLCDT (YYMMDD) -> { tahun, bulan, tanggal }
function parseVxlcdt(vxlcdt) {
  const str = vxlcdt.toString().trim();
  if (str.length !== 6) return { tahun: null, bulan: null, tanggal: null };

  const yy = parseInt(str.substring(0, 2), 10);
  const mm = parseInt(str.substring(2, 4), 10);
  const dd = parseInt(str.substring(4, 6), 10);

  const tahun = yy < 50 ? 2000 + yy : 1900 + yy; // asumsi 2000-an

  return { tahun, bulan: mm, tanggal: dd };
}

// Ekstrak kode_cabang dari VXDBAC (3 digit pertama)
function extractKodeCabang(vxdbac) {
  if (!vxdbac) return null;
  return vxdbac.toString().trim().substring(0, 3);
}

// Normalisasi nama kolom: lowercase, trim, handle '#'
function normalizeColumnName(col) {
  return col
    .toString()
    .trim()
    .toLowerCase()
    .replace('#', '_num');
}

// Casting angka aman (kalau gagal parse -> null)
function toNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

// Hitung row_hash (MD5) dari kombinasi kolom unik
function calculateRowHash(row) {
  const raw = [
    row.vxstat, row.vxchnl, row.vxpcod, row.vxpdes,
    row.vxlcdt, row.vxlctm, row.vxamt, row.vxamfe,
    row.vxaqbn, row.vxisbn, row.vxdbc_num, row.vxdbac,
    row.vxb39, row.vxerr,
  ].join('|');

  return crypto.createHash('md5').update(raw).digest('hex');
}

// Fungsi utama: 1 baris mentah -> 1 baris siap insert ke DB
function transformRow(rawRow) {
  // Normalisasi key kolom dulu
  const row = {};
  for (const key in rawRow) {
    row[normalizeColumnName(key)] = rawRow[key];
  }

  // Validasi kolom wajib
  if (!row.vxlcdt || !row.vxchnl || !row.vxpdes) {
    return { valid: false, error: 'Kolom wajib (vxlcdt/vxchnl/vxpdes) tidak lengkap', raw: row };
  }

  const { tahun, bulan, tanggal } = parseVxlcdt(row.vxlcdt);
  const { produk, kategori } = getProdukKategori(row.vxpdes);
  const kode_cabang = extractKodeCabang(row.vxdbac);

  let tgl_full = null;
  if (tahun && bulan && tanggal) {
    const mm = bulan.toString().padStart(2, '0');
    const dd = tanggal.toString().padStart(2, '0');
    tgl_full = `${tahun}-${mm}-${dd}`;
  }

  const transformed = {
    vxstat: row.vxstat || null,
    vxchnl: row.vxchnl,
    vxpcod: row.vxpcod || null,
    vxpdes: row.vxpdes,
    vxlcdt: row.vxlcdt,
    vxlctm: row.vxlctm || null,
    vxamt: toNumber(row.vxamt),
    vxamfe: toNumber(row.vxamfe),
    vxaqbn: row.vxaqbn || null,
    vxisbn: row.vxisbn || null,
    vxdbc_num: row.vxdbc_num || row.vxdbc || null, // handle kolom 'VXDBC' tanpa '#'
    vxdbac: row.vxdbac || null,
    vxb39: row.vxb39 || null,
    vxerr: row.vxerr || null,

    tahun,
    bulan,
    tanggal,
    produk,
    kategori,
    kode_cabang,
    tgl_full,
  };

  transformed.row_hash = calculateRowHash(transformed);

  return { valid: true, data: transformed };
}

module.exports = { transformRow };