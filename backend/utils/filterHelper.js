const { Op } = require('sequelize');

// Bangun WHERE clause dari query params: tahun, bulan, produk, kategori, vxchnl, vxstat, kode_cabang
function buildWhereClause(query) {
  const where = {};

  if (query.tahun) where.tahun = query.tahun;
  if (query.bulan) where.bulan = query.bulan;
  if (query.produk) where.produk = query.produk;
  if (query.kategori) where.kategori = query.kategori;
  if (query.vxchnl) where.vxchnl = query.vxchnl;
  if (query.vxstat) where.vxstat = query.vxstat;
  if (query.kode_cabang) where.kode_cabang = query.kode_cabang;

  if (query.tanggal_awal && query.tanggal_akhir) {
    where.tgl_full = { [Op.between]: [query.tanggal_awal, query.tanggal_akhir] };
  } else if (query.tanggal_awal) {
    where.tgl_full = { [Op.gte]: query.tanggal_awal };
  } else if (query.tanggal_akhir) {
    where.tgl_full = { [Op.lte]: query.tanggal_akhir };
  }

  return where;
}

module.exports = { buildWhereClause };