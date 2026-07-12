const multer = require('multer');
const path = require('path');

// Simpan file sementara di folder uploads/ sebelum diproses
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Hanya izinkan file excel/csv
const fileFilter = (req, file, cb) => {
  const allowedExt = ['.xlsx', '.xls', '.csv', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan .xlsx, .xls, .csv, atau .txt'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;