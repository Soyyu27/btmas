const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${req.query.search}%` } },
        { full_name: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] }, // jangan pernah kirim password walau sudah hashed
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data user', error: error.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { username, password, full_name, role, kode_cabang } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }
    if (role === 'cabang' && !kode_cabang) {
      return res.status(400).json({ message: 'Kode cabang wajib diisi untuk role cabang' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username sudah dipakai' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username, password: hashedPassword, full_name, role,
      kode_cabang: role === 'cabang' ? kode_cabang : null,
    });

    const { password: _, ...userSafe } = user.toJSON();
    res.status(201).json(userSafe);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat user', error: error.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const { full_name, role, kode_cabang, is_active, password } = req.body;
    const updateData = { full_name, role, kode_cabang: role === 'cabang' ? kode_cabang : null, is_active };

    // Password cuma diupdate kalau diisi (opsional saat edit)
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    const { password: _, ...userSafe } = user.toJSON();
    res.json(userSafe);
  } catch (error) {
    res.status(500).json({ message: 'Gagal update user', error: error.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    await user.destroy();
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus user', error: error.message });
  }
};

// GET /api/users/me — profil user yang sedang login
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil profil', error: error.message });
  }
};

// PUT /api/users/me — update profil sendiri (nama, password)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { full_name, current_password, new_password } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: 'Password lama wajib diisi untuk ganti password' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Password lama salah' });
      }
      updateData.password = await bcrypt.hash(new_password, 10);
    }

    await user.update(updateData);
    const { password: _, ...userSafe } = user.toJSON();
    res.json({ message: 'Profil berhasil diperbarui', user: userSafe });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update profil', error: error.message });
  }
};