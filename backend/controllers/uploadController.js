const fs = require('fs');
const path = require('path');
const { UploadLog } = require('../models');
const { streamCsvToTemp, streamExcelToTemp, COLUMN_ORDER } = require('../utils/streamEtl');
const mysqlPool = require('../config/mysqlPool');

// Deteksi delimiter dari baris pertama file (tab atau koma)
function detectDelimiter(filePath) {
  const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
  return firstLine.includes('\t') ? '\t' : ',';
}

// Jalankan LOAD DATA INFILE ke MySQL dari file CSV yang sudah bersih
async function loadDataInfile(tempCsvPath) {
  const columnList = COLUMN_ORDER.join(', ');
  // IGNORE = skip baris yang bentrok unique key (row_hash), tidak error
  const sql = `
    LOAD DATA LOCAL INFILE ${mysqlPool.escape(tempCsvPath)}
    IGNORE INTO TABLE transactions
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    (${columnList})
  `;
  const conn = await mysqlPool.getConnection();
  try {
    const [result] = await conn.query({ sql, infileStreamFactory: () => fs.createReadStream(tempCsvPath) });
    return result.affectedRows || 0;
  } finally {
    conn.release();
  }
}

// Proses upload berjalan di background, tidak di-await oleh response HTTP
async function processUploadInBackground(logId, filePath, ext, originalName) {
  const tempCsvPath = path.join('uploads', `processed-${logId}.csv`);

  try {
    let stats;
    if (ext === '.xlsx' || ext === '.xls') {
      stats = await streamExcelToTemp(filePath, tempCsvPath);
    } else {
      const delimiter = detectDelimiter(filePath);
      stats = await streamCsvToTemp(filePath, delimiter, tempCsvPath);
    }

    const insertedCount = await loadDataInfile(tempCsvPath);
    const duplikatDiskip = stats.validRows - insertedCount;

    await UploadLog.update({
      total_baris_file: stats.totalRows,
      berhasil_insert: insertedCount,
      baris_tidak_valid: stats.invalidRows,
      duplikat_diskip: duplikatDiskip >= 0 ? duplikatDiskip : 0,
      status: stats.invalidRows > 0 ? 'partial' : 'success',
    }, { where: { id: logId } });
  } catch (error) {
    console.error('BACKGROUND UPLOAD ERROR:', error.message);
    await UploadLog.update({
      status: 'failed',
      error_message: error.message,
    }, { where: { id: logId } });
  } finally {
    // Bersihkan file sementara
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(tempCsvPath)) fs.unlinkSync(tempCsvPath);
  }
}

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File tidak ditemukan' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();

  // Buat log dengan status 'processing' dulu, langsung balas ke frontend
  const log = await UploadLog.create({
    filename: req.file.originalname,
    uploaded_by: req.user.id,
    status: 'processing',
  });

  // Jalankan proses berat di background — TIDAK di-await
  processUploadInBackground(log.id, req.file.path, ext, req.file.originalname);

  // Langsung balas, tidak nunggu proses selesai
  res.status(202).json({
    message: 'File diterima, sedang diproses di background',
    logId: log.id,
    status: 'processing',
  });
};

// Endpoint untuk cek status upload tertentu (dipakai frontend polling)
exports.getUploadStatus = async (req, res) => {
  const log = await UploadLog.findByPk(req.params.id);
  if (!log) return res.status(404).json({ message: 'Log tidak ditemukan' });
  res.json(log);
};

// Histori upload (tetap sama seperti sebelumnya)
exports.getUploadHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await UploadLog.findAndCountAll({
      include: [{ model: require('../models').User, as: 'uploader', attributes: ['id', 'username', 'full_name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: { total_data: count, current_page: page, total_page: Math.ceil(count / limit), limit },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil histori upload', error: error.message });
  }
};