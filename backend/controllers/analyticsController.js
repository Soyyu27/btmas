const { Transaction } = require('../models');
const { fn, col, literal } = require('sequelize');
const { buildWhereClause } = require('../utils/filterHelper');

// Whitelist kolom yang boleh di-breakdown (keamanan, cegah SQL injection lewat field sembarangan)
const ALLOWED_FIELDS = {
  cabang: 'kode_cabang',
  produk: 'produk',
  kategori: 'kategori',
  channel: 'vxchnl',
  error: 'vxerr',
  'response-code': 'vxerr',
  issuer: 'vxisbn',
  acquirer: 'vxaqbn',
};

// Breakdown generic: GET /api/dashboard/breakdown/:dimension
exports.getBreakdown = async (req, res) => {
  try {
    const dimension = req.params.dimension;
    const dbField = ALLOWED_FIELDS[dimension];

    if (!dbField) {
      return res.status(400).json({ message: `Dimensi '${dimension}' tidak dikenali` });
    }

    const where = buildWhereClause(req.query);
    const limit = parseInt(req.query.limit) || 20;

    const result = await Transaction.findAll({
      where,
      attributes: [
        [col(dbField), 'label'],
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
        [fn('SUM', col('vxamfe')), 'total_fee'],
        [fn('COUNT', literal(`CASE WHEN vxstat = 'P' THEN 1 END`)), 'total_success'],
      ],
      group: [dbField],
      order: [[literal('jumlah_transaksi'), 'DESC']],
      limit,
      raw: true,
    });

    const data = result.map((r) => ({
      label: r.label || 'Tidak diketahui',
      jumlah_transaksi: parseInt(r.jumlah_transaksi) || 0,
      total_nominal: parseFloat(r.total_nominal) || 0,
      total_fee: parseFloat(r.total_fee) || 0,
      success_rate: r.jumlah_transaksi > 0 ? ((r.total_success / r.jumlah_transaksi) * 100).toFixed(2) : 0,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data breakdown', error: error.message });
  }
};

// Distribusi nominal ke dalam range (untuk halaman Amount)
exports.getAmountDistribution = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const ranges = [
      { label: '< 50rb', min: 0, max: 50000 },
      { label: '50rb - 200rb', min: 50000, max: 200000 },
      { label: '200rb - 500rb', min: 200000, max: 500000 },
      { label: '500rb - 1jt', min: 500000, max: 1000000 },
      { label: '> 1jt', min: 1000000, max: null },
    ];

    const { Op } = require('sequelize');
    const results = await Promise.all(
      ranges.map(async (r) => {
        const rangeWhere = { ...where, vxamt: r.max ? { [Op.gte]: r.min, [Op.lt]: r.max } : { [Op.gte]: r.min } };
        const count = await Transaction.count({ where: rangeWhere });
        return { label: r.label, jumlah_transaksi: count };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil distribusi nominal', error: error.message });
  }
};