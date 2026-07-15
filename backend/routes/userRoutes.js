const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getAllUsers, createUser, updateUser, deleteUser, getProfile, updateProfile,
} = require('../controllers/userController');

router.use(verifyToken);

// Profil sendiri — semua role boleh akses
router.get('/me', getProfile);
router.put('/me', updateProfile);

// Manajemen user — admin only
router.get('/', requireRole('admin'), getAllUsers);
router.post('/', requireRole('admin'), createUser);
router.put('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;