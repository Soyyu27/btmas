const { Transaction, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { buildWhereClause } = require('../utils/filterHelper');
const { Parser } = require('json2csv'); // install: npm install json2csv
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

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
        [fn('SUM', col('vxamfe')), 'total_fee'],

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
        [fn('SUM', col('vxamfe')), 'total_fee'],
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
// 12. Export data transaksi ke Excel (sesuai filter aktif, bukan cuma 1 halaman)
exports.exportTransactions = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    if (req.query.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { vxpdes: { [Op.like]: `%${req.query.search}%` } },
        { produk: { [Op.like]: `%${req.query.search}%` } },
        { vxchnl: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Batas aman biar tidak nge-hang kalau data jutaan baris
    const MAX_EXPORT = 50000;
    const rows = await Transaction.findAll({
      where,
      order: [['tgl_full', 'DESC']],
      limit: MAX_EXPORT,
      raw: true,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data Transaksi');

    sheet.columns = [
      { header: 'Tanggal', key: 'tgl_full', width: 14 },
      { header: 'Channel', key: 'vxchnl', width: 10 },
      { header: 'Produk', key: 'produk', width: 16 },
      { header: 'Kategori', key: 'kategori', width: 16 },
      { header: 'Deskripsi', key: 'vxpdes', width: 28 },
      { header: 'Cabang', key: 'kode_cabang', width: 10 },
      { header: 'Nominal', key: 'vxamt', width: 15 },
      { header: 'Fee', key: 'vxamfe', width: 12 },
      { header: 'Status', key: 'vxstat', width: 10 },
      { header: 'Error Code', key: 'vxerr', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12203A' } };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    rows.forEach((r) => sheet.addRow(r));
    sheet.getColumn('vxamt').numFmt = '#,##0.00';
    sheet.getColumn('vxamfe').numFmt = '#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=data-transaksi-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Gagal export data', error: error.message });
  }
};

//13. Export CSV (lebih ringan dari Excel, cocok untuk data besar)
exports.exportTransactionsCsv = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    if (req.query.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { vxpdes: { [Op.like]: `%${req.query.search}%` } },
        { produk: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const rows = await Transaction.findAll({
      where,
      order: [['tgl_full', 'DESC']],
      limit: 50000,
      raw: true,
      attributes: ['tgl_full', 'vxchnl', 'produk', 'kategori', 'vxpdes', 'kode_cabang', 'vxamt', 'vxamfe', 'vxstat', 'vxerr'],
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-transaksi-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Gagal export CSV', error: error.message });
  }
};

//14. Export PDF Ringkasan (KPI + Top 5 Produk/Channel/Cabang) — laporan resmi, bukan data mentah
exports.exportSummaryPdf = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const [kpiRow, topProduk, topChannel, topCabang] = await Promise.all([
      Transaction.findOne({
        where,
        attributes: [
          [fn('COUNT', col('id')), 'total_transaksi'],
          [fn('SUM', col('vxamt')), 'total_nominal'],
          [fn('SUM', col('vxamfe')), 'total_fee'],
          [fn('COUNT', literal(`CASE WHEN vxstat = 'P' THEN 1 END`)), 'total_success'],
        ],
        raw: true,
      }),
      Transaction.findAll({ where, attributes: ['produk', [fn('COUNT', col('id')), 'jumlah']], group: ['produk'], order: [[literal('jumlah'), 'DESC']], limit: 5, raw: true }),
      Transaction.findAll({ where, attributes: ['vxchnl', [fn('COUNT', col('id')), 'jumlah']], group: ['vxchnl'], order: [[literal('jumlah'), 'DESC']], limit: 5, raw: true }),
      Transaction.findAll({ where, attributes: ['kode_cabang', [fn('COUNT', col('id')), 'jumlah']], group: ['kode_cabang'], order: [[literal('jumlah'), 'DESC']], limit: 5, raw: true }),
    ]);

    const total = parseInt(kpiRow.total_transaksi) || 0;
    const success = parseInt(kpiRow.total_success) || 0;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(2) : 0;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-ringkasan-${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('Laporan Ringkasan Transaksi', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#8A93A6').text('Bank Transaction Monitoring System', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
    if (req.query.tanggal_awal || req.query.tanggal_akhir) {
      doc.text(`Periode: ${req.query.tanggal_awal || '-'} s/d ${req.query.tanggal_akhir || '-'}`, { align: 'center' });
    }
    doc.moveDown(1.5);
    doc.strokeColor('#E2E5EB').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // KPI
    doc.fillColor('#1D2433').fontSize(12).font('Helvetica-Bold').text('Ringkasan KPI');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    const kpiLines = [
      ['Total Transaksi', total.toLocaleString('id-ID')],
      ['Total Nominal', 'Rp ' + (parseFloat(kpiRow.total_nominal) || 0).toLocaleString('id-ID')],
      ['Total Fee', 'Rp ' + (parseFloat(kpiRow.total_fee) || 0).toLocaleString('id-ID')],
      ['Success Rate', `${successRate}%`],
    ];
    kpiLines.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true, width: 200 });
      doc.text(value, { align: 'right' });
    });
    doc.moveDown(1.5);

    // Helper buat render tabel simpel
    const renderTable = (title, data, labelKey, valueKey) => {
      doc.fontSize(12).font('Helvetica-Bold').text(title);
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      if (data.length === 0) {
        doc.fillColor('#8A93A6').text('Tidak ada data');
      } else {
        data.forEach((d) => {
          doc.fillColor('#1D2433').text(d[labelKey] || '-', 50, doc.y, { continued: true, width: 250 });
          doc.text(String(d[valueKey]), { align: 'right' });
        });
      }
      doc.moveDown(1.2);
    };

    renderTable('Top 5 Produk', topProduk, 'produk', 'jumlah');
    renderTable('Top 5 Channel', topChannel, 'vxchnl', 'jumlah');
    renderTable('Top 5 Cabang', topCabang, 'kode_cabang', 'jumlah');

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Gagal export PDF', error: error.message });
  }
};