const { Op } = require('sequelize');

// Factory: bikin controller CRUD generic dari 1 Sequelize model
// primaryKey: nama kolom primary key (beda-beda tiap tabel: 'kode_cabang', 'id', dst)
// searchFields: kolom mana saja yang bisa dicari pakai ?search=
function createCrudController(Model, primaryKey, searchFields = []) {
  return {
    // GET /api/master/:entity
    getAll: async (req, res) => {
      try {
        const where = {};
        if (req.query.search && searchFields.length > 0) {
          where[Op.or] = searchFields.map((field) => ({ [field]: { [Op.like]: `%${req.query.search}%` } }));
        }
        const data = await Model.findAll({ where, order: [[primaryKey, 'ASC']] });
        res.json(data);
      } catch (error) {
        res.status(500).json({ message: 'Gagal ambil data master', error: error.message });
      }
    },

    // GET /api/master/:entity/:id
    getOne: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(item);
      } catch (error) {
        res.status(500).json({ message: 'Gagal ambil data', error: error.message });
      }
    },

    // POST /api/master/:entity
    create: async (req, res) => {
      try {
        const item = await Model.create(req.body);
        res.status(201).json(item);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Kode/nama sudah terdaftar' });
        }
        res.status(500).json({ message: 'Gagal membuat data', error: error.message });
      }
    },

    // PUT /api/master/:entity/:id
    update: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan' });
        await item.update(req.body);
        res.json(item);
      } catch (error) {
        res.status(500).json({ message: 'Gagal update data', error: error.message });
      }
    },

    // DELETE /api/master/:entity/:id
    remove: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Data tidak ditemukan' });
        await item.destroy();
        res.json({ message: 'Data berhasil dihapus' });
      } catch (error) {
        res.status(500).json({ message: 'Gagal hapus data', error: error.message });
      }
    },
  };
}

module.exports = { createCrudController };