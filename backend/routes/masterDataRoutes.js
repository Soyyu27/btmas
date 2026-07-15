const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { createCrudController } = require('../controllers/masterDataController');
const {
  MasterCabang, MasterChannel, MasterProduk, MasterResponseCode, MasterErrorCode,
} = require('../models');

router.use(verifyToken);

// Hanya admin yang boleh create/update/delete; semua role boleh lihat (GET)
const adminOnly = requireRole('admin');

function registerCrudRoutes(path, Model, searchFields) {
  const controller = createCrudController(Model, Model.primaryKeyAttribute, searchFields);
  router.get(`/${path}`, controller.getAll);
  router.get(`/${path}/:id`, controller.getOne);
  router.post(`/${path}`, adminOnly, controller.create);
  router.put(`/${path}/:id`, adminOnly, controller.update);
  router.delete(`/${path}/:id`, adminOnly, controller.remove);
}

registerCrudRoutes('cabang', MasterCabang, ['kode_cabang', 'nama_cabang']);
registerCrudRoutes('channel', MasterChannel, ['kode_channel', 'nama_channel']);
registerCrudRoutes('produk', MasterProduk, ['nama_produk', 'kategori']);
registerCrudRoutes('response-code', MasterResponseCode, ['kode', 'keterangan']);
registerCrudRoutes('error-code', MasterErrorCode, ['kode', 'keterangan']);

module.exports = router;