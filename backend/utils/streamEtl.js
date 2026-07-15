const fs = require('fs');
const readline = require('readline');
const ExcelJS = require('exceljs');
const { transformRow } = require('./etl');

// Kolom sesuai urutan tabel transactions (tanpa id/created_at/updated_at, MySQL isi otomatis)
const COLUMN_ORDER = [
  'vxstat', 'vxchnl', 'vxpcod', 'vxpdes', 'vxlcdt', 'vxlctm',
  'vxamt', 'vxamfe', 'vxaqbn', 'vxisbn', 'vxdbc_num', 'vxdbac',
  'vxb39', 'vxerr', 'tahun', 'bulan', 'tanggal', 'produk',
  'kategori', 'kode_cabang', 'tgl_full', 'row_hash',
];

// Escape 1 nilai untuk CSV output (handle koma, kutip, null)
function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsvLine(transformed) {
  return COLUMN_ORDER.map((col) => csvEscape(transformed[col])).join(',') + '\n';
}

// Proses file CSV/TXT secara streaming (baris per baris)
async function streamCsvToTemp(sourcePath, delimiter, outputPath) {
  const rl = readline.createInterface({ input: fs.createReadStream(sourcePath), crlfDelay: Infinity });
  const outStream = fs.createWriteStream(outputPath);

  let header = null;
  let totalRows = 0;
  let validRows = 0;
  let invalidRows = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (!header) {
      header = line.split(delimiter).map((h) => h.trim());
      continue;
    }

    totalRows++;
    const values = line.split(delimiter);
    const rawRow = {};
    header.forEach((col, idx) => { rawRow[col] = values[idx]; });

    const result = transformRow(rawRow);
    if (result.valid) {
      outStream.write(rowToCsvLine(result.data));
      validRows++;
    } else {
      invalidRows++;
    }
  }

  outStream.end();
  await new Promise((resolve) => outStream.on('finish', resolve));

  return { totalRows, validRows, invalidRows };
}

// Proses file Excel secara streaming (tidak load semua sheet ke memori sekaligus)
async function streamExcelToTemp(sourcePath, outputPath) {
  const outStream = fs.createWriteStream(outputPath);
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(sourcePath, {});

  let totalRows = 0;
  let validRows = 0;
  let invalidRows = 0;

  for await (const worksheetReader of workbookReader) {
    let header = null;
    for await (const row of worksheetReader) {
      const values = row.values.slice(1); // index 0 selalu kosong di exceljs

      if (!header) {
        header = values.map((h) => (h || '').toString().trim());
        continue;
      }

      totalRows++;
      const rawRow = {};
      header.forEach((col, idx) => { rawRow[col] = values[idx]; });

      const result = transformRow(rawRow);
      if (result.valid) {
        outStream.write(rowToCsvLine(result.data));
        validRows++;
      } else {
        invalidRows++;
      }
    }
  }

  outStream.end();
  await new Promise((resolve) => outStream.on('finish', resolve));

  return { totalRows, validRows, invalidRows };
}

module.exports = { streamCsvToTemp, streamExcelToTemp, COLUMN_ORDER };