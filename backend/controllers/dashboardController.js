const { Transaction, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { buildWhereClause } = require('../utils/filterHelper');

// 1. KPI Summary (kartu atas dashboard)
exports.getKpi = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const result = await Transaction.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'total_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
        [fn('SUM', col('vxamfe')), 'total_fee'],
        [fn('COUNT', literal(`CASE WHEN vxstat = 'P' THEN 1 END`)), 'total_success'],
        [fn('COUNT', fn('DISTINCT', col('kode_cabang'))), 'jumlah_cabang'],
        [fn('COUNT', fn('DISTINCT', col('vxchnl'))), 'jumlah_channel'],
        [fn('COUNT', fn('DISTINCT', col('produk'))), 'jumlah_produk'],
      ],
      raw: true,
    });

    const total = parseInt(result.total_transaksi) || 0;
    const success = parseInt(result.total_success) || 0;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(2) : 0;

    res.json({
      total_transaksi: total,
      total_nominal: parseFloat(result.total_nominal) || 0,
      total_fee: parseFloat(result.total_fee) || 0,
      success_rate: parseFloat(successRate),
      jumlah_cabang: parseInt(result.jumlah_cabang) || 0,
      jumlah_channel: parseInt(result.jumlah_channel) || 0,
      jumlah_produk: parseInt(result.jumlah_produk) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data KPI', error: error.message });
  }
};

// 2. Trend Transaksi & Nominal Harian (Line chart)
exports.getTrendHarian = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const result = await Transaction.findAll({
      where,
      attributes: [
        'tgl_full',
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
      ],
      group: ['tgl_full'],
      order: [['tgl_full', 'ASC']],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil trend harian', error: error.message });
  }
};

// 3. Status Transaksi (Donut chart)
exports.getStatusDistribution = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const result = await Transaction.findAll({
      where,
      attributes: ['vxstat', [fn('COUNT', col('id')), 'jumlah']],
      group: ['vxstat'],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil status distribution', error: error.message });
  }
};

// 4. Top Channel (Horizontal bar)
exports.getTopChannel = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const result = await Transaction.findAll({
      where,
      attributes: [
        'vxchnl',
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
      ],
      group: ['vxchnl'],
      order: [[literal('jumlah_transaksi'), 'DESC']],
      limit,
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil top channel', error: error.message });
  }
};

// 5. Top Produk (Horizontal bar)
exports.getTopProduk = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const result = await Transaction.findAll({
      where,
      attributes: [
        'produk',
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
      ],
      group: ['produk'],
      order: [[literal('jumlah_transaksi'), 'DESC']],
      limit,
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil top produk', error: error.message });
  }
};

// 6. Top Cabang (Horizontal bar) - berdasarkan kode_cabang
exports.getTopCabang = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const result = await Transaction.findAll({
      where: { ...where, kode_cabang: { [Op.ne]: null } },
      attributes: [
        'kode_cabang',
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
      ],
      group: ['kode_cabang'],
      order: [[literal('jumlah_transaksi'), 'DESC']],
      limit,
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil top cabang', error: error.message });
  }
};

// 7. Kategori vs Status (Stacked bar) - contoh gabungan 2 dimensi
exports.getKategoriVsStatus = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const result = await Transaction.findAll({
      where,
      attributes: [
        'kategori',
        'vxstat',
        [fn('COUNT', col('id')), 'jumlah'],
      ],
      group: ['kategori', 'vxstat'],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil kategori vs status', error: error.message });
  }
};

// 8. Opsi untuk dropdown filter (produk, kategori, channel, status, cabang, tahun, bulan)
exports.getFilterOptions = async (req, res) => {
  try {
    const [produk, kategori, channel, status, cabang, tahun] = await Promise.all([
      Transaction.aggregate('produk', 'DISTINCT', { plain: false }),
      Transaction.aggregate('kategori', 'DISTINCT', { plain: false }),
      Transaction.aggregate('vxchnl', 'DISTINCT', { plain: false }),
      Transaction.aggregate('vxstat', 'DISTINCT', { plain: false }),
      Transaction.aggregate('kode_cabang', 'DISTINCT', { plain: false }),
      Transaction.aggregate('tahun', 'DISTINCT', { plain: false }),
    ]);

    const clean = (arr, field) => arr.map((item) => item[field]).filter((v) => v !== null);

    res.json({
      produk: clean(produk, 'DISTINCT'),
      kategori: clean(kategori, 'DISTINCT'),
      channel: clean(channel, 'DISTINCT'),
      status: clean(status, 'DISTINCT'),
      cabang: clean(cabang, 'DISTINCT'),
      tahun: clean(tahun, 'DISTINCT'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil filter options', error: error.message });
  }
};

// 9. List transaksi dengan pagination, search, sort, filter (untuk halaman Data Transaksi)
exports.getTransactions = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Search bebas (cari di vxpdes, produk, vxchnl, vxaqbn)
    if (req.query.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { vxpdes: { [Op.like]: `%${req.query.search}%` } },
        { produk: { [Op.like]: `%${req.query.search}%` } },
        { vxchnl: { [Op.like]: `%${req.query.search}%` } },
        { vxaqbn: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Sorting (default: tanggal terbaru dulu)
    const sortField = req.query.sort_by || 'tgl_full';
    const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total_data: count,
        current_page: page,
        total_page: Math.ceil(count / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data transaksi', error: error.message });
  }
};

// 10. Detail 1 transaksi (untuk modal "klik satu transaksi")
exports.getTransactionDetail = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil detail transaksi', error: error.message });
  }
};
// 11. Trend Bulanan (untuk grafik awal, sebelum drill-down ke harian)
exports.getTrendBulanan = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const result = await Transaction.findAll({
      where,
      attributes: [
        'tahun',
        'bulan',
        [fn('COUNT', col('id')), 'jumlah_transaksi'],
        [fn('SUM', col('vxamt')), 'total_nominal'],
      ],
      group: ['tahun', 'bulan'],
      order: [['tahun', 'ASC'], ['bulan', 'ASC']],
      raw: true,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil trend bulanan', error: error.message });
  }
};