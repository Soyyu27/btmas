const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile , previewFile} = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

// Wajib login untuk upload
router.post('/', verifyToken, upload.single('file'), uploadFile);
router.post('/preview', verifyToken, upload.single('file'), previewFile);
router.post('/', verifyToken, upload.single('file'), uploadFile);

module.exports = router;