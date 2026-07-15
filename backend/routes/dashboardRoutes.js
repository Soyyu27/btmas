const express = require('express');
const router = express.Router();
const { verifyToken, applyBranchScope } = require('../middleware/authMiddleware');
const {
  getKpi,
  getTrendHarian,
  getStatusDistribution,
  getTopChannel,
  getTopProduk,
  getTopCabang,
  getKategoriVsStatus,
  getFilterOptions,
  getTransactions,        // baru
  getTransactionDetail, 
  getTrendBulanan,
  exportTransactions,
  exportTransactionsCsv, 
  exportSummaryPdf
    // baru
} = require('../controllers/dashboardController');

router.use(verifyToken); // semua route dashboard wajib login
router.use(applyBranchScope); 

router.get('/kpi', getKpi);
router.get('/trend-harian', getTrendHarian);
router.get('/status', getStatusDistribution);
router.get('/top-channel', getTopChannel);
router.get('/top-produk', getTopProduk);
router.get('/top-cabang', getTopCabang);
router.get('/kategori-vs-status', getKategoriVsStatus);
router.get('/filters', getFilterOptions);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionDetail);
router.get('/trend-bulanan', getTrendBulanan);
router.get('/transactions/export', exportTransactions);
router.get('/transactions/export-csv', exportTransactionsCsv);
router.get('/report/summary-pdf', exportSummaryPdf);

module.exports = router;