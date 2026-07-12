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

// Paksa filter kode_cabang untuk role 'cabang', abaikan value dari frontend
const applyBranchScope = (req, res, next) => {
  if (req.user.role === 'cabang' && req.user.kode_cabang) {
    req.query.kode_cabang = req.user.kode_cabang;
  }
  next();
};

module.exports = { verifyToken, requireRole, applyBranchScope };