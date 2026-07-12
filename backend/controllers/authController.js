const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register user baru
exports.register = async (req, res) => {
  try {
    const { username, password, full_name, role, kode_cabang } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username sudah dipakai' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
    username,
    password: hashedPassword,
    full_name,
    role: role || 'auditor',
    kode_cabang: role === 'cabang' ? kode_cabang : null,
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal register', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun tidak aktif' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, kode_cabang: user.kode_cabang },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
    message: 'Login berhasil',
    token,
    user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        kode_cabang: user.kode_cabang,
    },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal login', error: error.message });
  }
};