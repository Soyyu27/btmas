const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid atau expired' });
    req.user = decoded;
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak punya akses untuk aksi ini' });
  }
  next();
};

const { User } = require('../models');

// Paksa filter kode_cabang untuk role 'cabang', abaikan value dari frontend
const applyBranchScope = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'cabang') {
      let kodeCabang = req.user.kode_cabang;

      // Jika token lama belum menyimpan kode_cabang, ambil langsung dari database
      if (!kodeCabang) {
        const dbUser = await User.findByPk(req.user.id, { attributes: ['kode_cabang'] });
        if (dbUser && dbUser.kode_cabang) {
          kodeCabang = dbUser.kode_cabang;
          req.user.kode_cabang = kodeCabang;
        }
      }

      // KUNCI STRICT: Paksa filter kode_cabang.
      // Jika kodeCabang tidak ada/null, beri dumi '___NONE___' agar TIDAK PERNAH menampilkan data keseluruhan bank!
      req.query.kode_cabang = kodeCabang || '___NONE___';
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken, requireRole, applyBranchScope };