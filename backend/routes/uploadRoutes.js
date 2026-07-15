const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getUploadHistory, getUploadStatus } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, upload.single('file'), uploadFile);
router.get('/history', verifyToken, getUploadHistory);
router.get('/status/:id', verifyToken, getUploadStatus);

module.exports = router;