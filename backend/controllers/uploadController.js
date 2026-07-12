const fs = require('fs');
const xlsx = require('xlsx');
const { Transaction } = require('../models');
const { transformRow } = require('../utils/etl');

exports.uploadFile = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    // 1. EXTRACT - baca file (xlsx bisa baca .xlsx/.xls/.csv sekaligus)
    const workbook = xlsx.readFile(filePath);
    let rawRows = [];

    // Gabung semua sheet kalau lebih dari 1 (untuk file Excel)
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = xlsx.utils.sheet_to_json(sheet, { defval: null });
      rawRows = rawRows.concat(sheetData);
    });

    if (rawRows.length === 0) {
      return res.status(400).json({ message: 'File kosong atau tidak terbaca' });
    }

    // 2. TRANSFORM - proses tiap baris lewat ETL
    const validRows = [];
    const invalidRows = [];

    rawRows.forEach((raw, index) => {
      const result = transformRow(raw);
      if (result.valid) {
        validRows.push(result.data);
      } else {
        invalidRows.push({ rowNumber: index + 2, error: result.error }); // +2 = offset header + index 0
      }
    });

    if (validRows.length === 0) {
      return res.status(400).json({
        message: 'Tidak ada baris valid untuk diproses',
        invalidRows,
      });
    }

    // 3. LOAD - bulk insert, skip duplikat via row_hash
    const result = await Transaction.bulkCreate(validRows, {
      ignoreDuplicates: true, // MySQL: pakai INSERT IGNORE, skip kalau row_hash sudah ada
    });

    // 4. Cleanup - hapus file sementara
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Upload berhasil diproses',
      summary: {
        total_baris_file: rawRows.length,
        berhasil_insert: result.length,
        baris_tidak_valid: invalidRows.length,
        kemungkinan_duplikat_diskip: rawRows.length - result.length - invalidRows.length,
      },
      invalidRows: invalidRows.length > 0 ? invalidRows : undefined,
    });
  } catch (error) {
    // Cleanup file kalau error di tengah proses
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: 'Gagal memproses upload', error: error.message });
  }
};  
// Preview: baca file, transform, TAPI TIDAK insert ke DB
exports.previewFile = async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const workbook = xlsx.readFile(filePath);
    let rawRows = [];
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      rawRows = rawRows.concat(xlsx.utils.sheet_to_json(sheet, { defval: null }));
    });

    const preview = rawRows.slice(0, 20).map((raw, index) => {
      const result = transformRow(raw);
      return result.valid
        ? { rowNumber: index + 2, status: 'valid', data: result.data }
        : { rowNumber: index + 2, status: 'invalid', error: result.error };
    });

    fs.unlinkSync(filePath);

    res.json({
      total_baris: rawRows.length,
      preview_ditampilkan: preview.length,
      preview,
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Gagal preview file', error: error.message });
  }
};